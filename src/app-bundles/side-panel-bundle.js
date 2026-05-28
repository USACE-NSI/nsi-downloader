import { actions as nsiActions } from "./nsi-bundle.js";

export const actions = {
  INITIALIZED_START: "SIDE_PANEL_INITIALIZED_START",
  INITIALIZED: "SIDE_PANEL_INITIALIZED",
  PROPERTIES_LISTED: "SIDE_PANEL_PROPERTIES_LISTED",
  PROPERTY_SELECTED: "SIDE_PANEL_PROPERTY_SELECTED",
  COMPUTE_STARTED: "SIDE_PANEL_COMPUTE_STARTED",
  STATS_COMPUTED: "SIDE_PANEL_STATS_COMPUTED",
  COMPUTE_ABORTED: "SIDE_PANEL_COMPUTE_ABORTED",
};

function computeNumericStats(values) {
  const nums = values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const sum = nums.reduce((acc, v) => acc + v, 0);
  const mid = Math.floor(nums.length / 2);
  const median =
    nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
  return {
    kind: "numeric",
    count: nums.length,
    min: nums[0],
    max: nums[nums.length - 1],
    mean: sum / nums.length,
    median,
  };
}

function computeStringStats(values) {
  const counts = new Map();
  for (const v of values) {
    const key = String(v);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let mode = null;
  let modeCount = -1;
  for (const [k, c] of counts) {
    if (c > modeCount) {
      mode = k;
      modeCount = c;
    }
  }
  return {
    kind: "string",
    count: values.length,
    unique: counts.size,
    mode,
    modeCount,
    options: Array.from(counts.entries()).map(([value, count]) => ({
      value,
      count,
    })),
  };
}

function computeStatsForProperty(values) {
  const nonNull = values.filter(
    (v) => v !== null && v !== undefined && v !== "",
  );
  if (nonNull.length === 0) return { kind: "empty", count: 0 };
  const allNumeric = nonNull.every((v) => Number.isFinite(Number(v)));
  return allNumeric
    ? computeNumericStats(nonNull)
    : computeStringStats(nonNull);
}

// All NSI features share the same schema, so one feature is enough.
function extractPropertyNames(features) {
  if (features.length === 0) return [];
  const props = features[0].getProperties();
  return Object.keys(props).filter((k) => k !== "geometry");
}

export default {
  name: "sidePanel",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      propertyNames: [],
      stats: {},
      selectedProperty: null,
      computing: false,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case nsiActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case nsiActions.CLEARED:
          return {
            ...state,
            propertyNames: [],
            stats: {},
            selectedProperty: null,
            computing: false,
          };
        case actions.PROPERTIES_LISTED:
          return {
            ...state,
            propertyNames: payload.propertyNames,
            selectedProperty: payload.selectedProperty,
            stats: {},
            computing: false,
          };
        case actions.STATS_COMPUTED:
          return {
            ...state,
            stats: { ...state.stats, ...payload.stats },
            computing: false,
          };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
        case actions.PROPERTY_SELECTED:
        case actions.COMPUTE_STARTED:
        case actions.COMPUTE_ABORTED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectSidePanelPropertyNames: (state) => state.sidePanel.propertyNames,
  selectSidePanelStats: (state) => state.sidePanel.stats,
  selectSidePanelSelectedProperty: (state) => state.sidePanel.selectedProperty,
  selectSidePanelComputing: (state) => state.sidePanel.computing,
  doSidePanelInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const layer = store.selectNsiLayer();
      if (!layer) return;
      const source = layer.getSource();
      const handleFeaturesLoaded = () => {
        const features = source.getFeatures();
        if (features.length === 0) {
          dispatch({
            type: actions.PROPERTIES_LISTED,
            payload: { propertyNames: [], selectedProperty: null },
          });
          return;
        }
        const propertyNames = extractPropertyNames(features);
        const selectedProperty =
          propertyNames.find((n) => n === "occtype") ??
          propertyNames[0] ??
          null;
        dispatch({
          type: actions.PROPERTIES_LISTED,
          payload: { propertyNames, selectedProperty },
        });
      };
      source.on("featuresloadend", handleFeaturesLoaded);
      if (source.getFeatures().length > 0) handleFeaturesLoaded();
      dispatch({ type: actions.INITIALIZED, payload: {} });
    };
  },
  doSidePanelSelectProperty: (property) => ({
    type: actions.PROPERTY_SELECTED,
    payload: { selectedProperty: property },
  }),
  doSidePanelComputeSelected: () => {
    return ({ store, dispatch }) => {
      const property = store.selectSidePanelSelectedProperty();
      if (!property) return;
      const layer = store.selectNsiLayer();
      if (!layer) return;
      const features = layer.getSource().getFeatures();
      if (features.length === 0) return;
      dispatch({
        type: actions.COMPUTE_STARTED,
        payload: { computing: true },
      });
      // Yield to the browser before scanning all features for this property.
      setTimeout(() => {
        if (store.selectSidePanelSelectedProperty() !== property) {
          dispatch({
            type: actions.COMPUTE_ABORTED,
            payload: { computing: false },
          });
          return;
        }
        const live = layer.getSource().getFeatures();
        if (live.length === 0) {
          dispatch({
            type: actions.COMPUTE_ABORTED,
            payload: { computing: false },
          });
          return;
        }
        const values = live.map((f) => f.get(property));
        const propStats = computeStatsForProperty(values);
        dispatch({
          type: actions.STATS_COMPUTED,
          payload: { stats: { [property]: propStats } },
        });
      }, 0);
    };
  },
  reactSidePanelShouldInit: (state) => {
    if (state.sidePanel._shouldInit)
      return { actionCreator: "doSidePanelInitialize" };
  },
  reactSidePanelShouldCompute: (state) => {
    const s = state.sidePanel;
    if (!s.selectedProperty) return;
    if (s.stats[s.selectedProperty]) return;
    if (s.computing) return;
    return { actionCreator: "doSidePanelComputeSelected" };
  },
};

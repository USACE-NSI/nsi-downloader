import { actions as nsiActions } from "./nsi-bundle.js";

export const actions = {
  INITIALIZED_START: "SIDE_PANEL_INITIALIZED_START",
  INITIALIZED: "SIDE_PANEL_INITIALIZED",
  STATS_COMPUTED: "SIDE_PANEL_STATS_COMPUTED",
  PROPERTY_SELECTED: "SIDE_PANEL_PROPERTY_SELECTED",
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
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return { kind: "empty", count: 0 };
  const allNumeric = nonNull.every((v) => Number.isFinite(Number(v)));
  return allNumeric
    ? computeNumericStats(nonNull)
    : computeStringStats(nonNull);
}

function computeStatsFromFeatures(features) {
  const propMap = new Map();
  for (const feat of features) {
    const props = feat.getProperties();
    for (const [key, val] of Object.entries(props)) {
      if (key === "geometry") continue;
      if (!propMap.has(key)) propMap.set(key, []);
      propMap.get(key).push(val);
    }
  }
  const stats = {};
  for (const [key, values] of propMap) {
    stats[key] = computeStatsForProperty(values);
  }
  return stats;
}

export default {
  name: "sidePanel",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      stats: {},
      selectedProperty: null,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case nsiActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
        case actions.STATS_COMPUTED:
        case actions.PROPERTY_SELECTED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectSidePanelStats: (state) => state.sidePanel.stats,
  selectSidePanelSelectedProperty: (state) => state.sidePanel.selectedProperty,
  selectSidePanelPropertyNames: (state) =>
    Object.keys(state.sidePanel.stats || {}),
  doSidePanelInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const layer = store.selectNsiLayer();
      if (!layer) return;
      const source = layer.getSource();
      const recompute = () => {
        const features = source.getFeatures();
        const stats = computeStatsFromFeatures(features);
        const payload = { stats };
        const currentSelected = store.selectSidePanelSelectedProperty();
        const names = Object.keys(stats);
        if (!currentSelected && names.length > 0) {
          payload.selectedProperty = names[0];
        }
        dispatch({ type: actions.STATS_COMPUTED, payload });
      };
      source.on("featuresloadend", recompute);
      if (source.getFeatures().length > 0) recompute();
      dispatch({ type: actions.INITIALIZED, payload: {} });
    };
  },
  doSidePanelSelectProperty: (property) => ({
    type: actions.PROPERTY_SELECTED,
    payload: { selectedProperty: property },
  }),
  reactSidePanelShouldInit: (state) => {
    if (state.sidePanel._shouldInit)
      return { actionCreator: "doSidePanelInitialize" };
  },
};

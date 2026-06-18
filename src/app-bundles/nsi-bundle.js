import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Style from "ol/style/Style.js";
import Circle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import { actions as mapActions } from "./map-bundle.js";
import { actions as drawActions } from "./draw-bundle.js";

// Hardcoded Jacksonville bbox — kept for reference while we wire query UI.
// const NSI_URL =
//   "/api/structures?bbox=-81.58418,30.25165,-81.58161,30.26939,-81.55898,30.26939,-81.55281,30.24998,-81.58418,30.25165";
const NSI_URL_BASE = "/api/structures?bbox=";

const stroke = new Stroke({ color: "#000", width: 1 });
const defaultStyle = new Style({
  image: new Circle({
    radius: 4,
    fill: new Fill({ color: "#2d96ff" }),
    stroke,
  }),
});

const geojsonFormat = new GeoJSON();

export const actions = {
  INITIALIZED_START: "NSI_INITIALIZED_START",
  INITIALIZED: "NSI_INITIALIZED",
  LOAD_STARTED: "NSI_LOAD_STARTED",
  LOAD_FINISHED: "NSI_LOAD_FINISHED",
  LOAD_ERRORED: "NSI_LOAD_ERRORED",
  BBOX_SET: "NSI_BBOX_SET",
  CLEARED: "NSI_CLEARED",
};

export default {
  name: "nsi",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      _shouldClear: false,
      layer: null,
      bbox: [],
      loading: false,
      loadError: null,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case mapActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case actions.BBOX_SET:
          return { ...state, bbox: payload?.bbox ?? [] };
        case drawActions.CLEARED:
          return { ...state, _shouldClear: true, bbox: [] };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
        case actions.LOAD_STARTED:
        case actions.LOAD_FINISHED:
        case actions.LOAD_ERRORED:
        case actions.CLEARED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectNsiLayer: (state) => state.nsi.layer,
  selectNsiBbox: (state) => state.nsi.bbox,
  selectNsiLoading: (state) => state.nsi.loading,
  selectNsiLoadError: (state) => state.nsi.loadError,
  doNsiSetBbox: (bbox) => ({ type: actions.BBOX_SET, payload: { bbox } }),
  doNsiInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const source = new VectorSource({
        attributions: "USACE",
        format: new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: map.getView().getProjection(),
        }),
      });
      const layer = new VectorLayer({
        declutter: true,
        source,
        style: defaultStyle,
      });
      map.addLayer(layer);
      dispatch({ type: actions.INITIALIZED, payload: { layer } });
    };
  },
  doNsiRefresh: () => {
    return async ({ store, dispatch }) => {
      const layer = store.selectNsiLayer();
      const bbox = store.selectNsiBbox();
      if (!layer || !bbox.length) return;
      const projection = store.selectMapMap().getView().getProjection();
      dispatch({
        type: actions.LOAD_STARTED,
        payload: { loading: true, loadError: null },
      });
      try {
        const polygonGeojsons = await Promise.all(
          bbox.map(async (ring) => {
            const res = await fetch(NSI_URL_BASE + ring);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          }),
        );

        // dedup if we have overlapping polygons
        const byId = new Map();
        for (const json of polygonGeojsons) {
          const features = geojsonFormat.readFeatures(json, {
            dataProjection: "EPSG:4326",
            featureProjection: projection,
          });
          for (const f of features) byId.set(f.get("fd_id"), f);
        }

        const source = layer.getSource();
        source.clear();
        source.addFeatures([...byId.values()]);
        dispatch({ type: actions.LOAD_FINISHED, payload: { loading: false } });
      } catch {
        dispatch({
          type: actions.LOAD_ERRORED,
          payload: { loading: false, loadError: "Failed to load features" },
        });
      }
    };
  },
  doNsiClear: () => {
    return ({ store, dispatch }) => {
      const layer = store.selectNsiLayer();
      if (layer) layer.getSource().clear();
      dispatch({
        type: actions.CLEARED,
        payload: { _shouldClear: false },
      });
    };
  },
  reactNsiShouldInit: (state) => {
    if (state.nsi._shouldInit) return { actionCreator: "doNsiInitialize" };
  },
  reactNsiShouldClear: (state) => {
    if (state.nsi._shouldClear) return { actionCreator: "doNsiClear" };
  },
};

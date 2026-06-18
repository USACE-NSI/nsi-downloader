import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import { Style, Fill, Stroke } from "ol/style";
import { toLonLat } from "ol/proj";
import { actions as mapActions } from "./map-bundle.js";

export const actions = {
  INITIALIZED_START: "DRAW_INITIALIZED_START",
  INITIALIZED: "DRAW_INITIALIZED",
  STARTED: "DRAW_STARTED",
  BBOX_UPDATED: "DRAW_BBOX_UPDATED",
  CLEARED: "DRAW_CLEARED",
};

export default {
  name: "draw",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      layer: null,
      source: null,
      bbox: [],
      drawing: false,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case mapActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
        case actions.STARTED:
        case actions.BBOX_UPDATED:
        case actions.CLEARED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectDrawLayer: (state) => state.draw.layer,
  selectDrawSource: (state) => state.draw.source,
  selectDrawBbox: (state) => state.draw.bbox,
  selectDrawDrawing: (state) => state.draw.drawing,
  doDrawInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const polySource = new VectorSource();
      const polyLayer = new VectorLayer({
        source: polySource,
        style: new Style({
          fill: new Fill({ color: "rgba(33,150,243,0.2)" }),
          stroke: new Stroke({ color: "#2196f3", width: 2 }),
        }),
      });
      map.addLayer(polyLayer);
      dispatch({
        type: actions.INITIALIZED,
        payload: { layer: polyLayer, source: polySource },
      });
    };
  },
  doDrawStart: () => {
    return ({ store, dispatch }) => {
      const map = store.selectMapMap();
      const polySource = store.selectDrawSource();
      if (!map || !polySource) return;
      polySource.clear();
      const draw = new Draw({ source: polySource, type: "Polygon" });
      const mod = new Modify({ source: polySource });
      const snap = new Snap({ source: polySource });
      map.addInteraction(draw);
      map.addInteraction(mod);
      map.addInteraction(snap);
      draw.on("drawend", (e) => {
        const coords = e.feature.getGeometry().getCoordinates()[0];
        const bbox = coords
          .map((coord) => toLonLat(coord))
          .map(([lon, lat]) => `${lon},${lat}`)
          .join(",");
        map.removeInteraction(draw);
        map.removeInteraction(mod);
        map.removeInteraction(snap);
        dispatch({
          type: actions.BBOX_UPDATED,
          payload: { bbox: [bbox], drawing: false },
        });
      });
      dispatch({ type: actions.STARTED, payload: { drawing: true } });
    };
  },
  doDrawClear: () => {
    return ({ store, dispatch }) => {
      const polySource = store.selectDrawSource();
      if (polySource) polySource.clear();
      dispatch({
        type: actions.CLEARED,
        payload: { bbox: [], drawing: false },
      });
    };
  },
  reactDrawShouldInit: (state) => {
    if (state.draw._shouldInit) return { actionCreator: "doDrawInitialize" };
  },
};

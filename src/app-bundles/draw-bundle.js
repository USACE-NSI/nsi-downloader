import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Draw, { createBox } from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import { Style, Fill, Stroke } from "ol/style";
import { actions as mapActions } from "./map-bundle.js";

const actions = {
  INITIALIZED_START: "DRAW_INITIALIZED_START",
  INITIALIZED: "DRAW_INITIALIZED",
};

export default {
  name: "draw",
  getReducer: () => {
    const initialState = { _shouldInit: false, layer: null };
    return (state = initialState, { type, payload }) => {
      //console.log(type, payload);
      switch (type) {
        case mapActions.INITIALIZED:
          return { ...state, ...{ _shouldInit: true } };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectDrawLayer: (state) => {
    return state.nsi.layer;
  },
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
          fill: new Fill({ color: "rgba(33,150,243,0.3)" }),
          stroke: new Stroke({ color: "#2196f3", width: 2 }),
        }),
      });
      map.addLayer(polyLayer);
      const draw = new Draw({
        source: polySource,
        type: "Circle",
        geometryFunction: createBox(),
      });
      const mod = new Modify({ source: polySource });
      const snap = new Snap({ source: polySource });
      map.addInteraction(draw);
      map.addInteraction(mod);
      map.addInteraction(snap);

      draw.on("drawend", (e) => {
        console.log("polygon:", e.feature.getGeometry().getCoordinates());
        const coords = e.feature.getGeometry().getCoordinates()[0];
        const bbox = coords.map((coord) => `${coord[0]},${coord[1]}`).join(",");
        store.doNsiAddStructures(bbox);
      });
      dispatch({ type: actions.INITIALIZED, payload: { layer: polyLayer } });
    };
  },
  reactDrawShouldInit: (state) => {
    if (state.draw._shouldInit) return { actionCreator: "doDrawInitialize" };
  },
};

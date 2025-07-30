import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import CircleStyle from "ol/style/Circle.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import { actions as mapActions } from "./map-bundle.js";

const actions = {
  INITIALIZED_START: "ZEBRA_INITIALIZED_START",
  INITIALIZED: "ZEBRA_INITIALIZED",
};

export default {
  name: "zebra",
  getReducer: () => {
    const initialState = { _shouldInit: false, layer: null };
    return (state = initialState, { type, payload }) => {
      //console.log(type, payload);
      switch (type) {
        case mapActions.INITIALIZED:
          return { ...state, ...{ _shouldInit: false } };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectZebraLayer: (state) => {
    return state.zebra.layer;
  },
  doZebraInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const layer = new VectorLayer({
        source: new VectorSource({
          format: new GeoJSON(),
          url: "Zebra Crossings.geojson",
        }),
        style: new Style({
          image: new CircleStyle({
            radius: 3,
            fill: null,
            stroke: new Stroke({ color: "blue", width: 3 }),
          }),
        }),
      });
      map.addLayer(layer);
      dispatch({ type: actions.INITIALIZED, payload: { layer: layer } });
    };
  },
  reactZebraShouldInit: (state) => {
    if (state.zebra._shouldInit) return { actionCreator: "doZebraInitialize" };
  },
};

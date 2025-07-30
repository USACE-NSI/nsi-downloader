import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import CircleStyle from "ol/style/Circle.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import { actions as mapActions } from "./map-bundle.js";

const actions = {
  INITIALIZED_START: "NSI_INITIALIZED_START",
  INITIALIZED: "NSI_INITIALIZED",
};

export default {
  name: "nsi",
  getReducer: () => {
    const initialState = { _shouldInit: false, layer: null };
    return (state = initialState, { type, payload }) => {
      console.log(type, payload);
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
  selectNsiLayer: (state) => {
    return state.nsi.layer;
  },
  doNsiInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const layerStyle = new Style({
        image: new CircleStyle({
          radius: 3,
          fill: null,
          stroke: new Stroke({ color: "blue", width: 3 }),
        }),
      });
      // const geojson = await GetNSI();
      // const vectorSource = new VectorSource({
      //   features: new GeoJSON().readFeatures(geojson),
      // });
      const vectorLayer = new VectorLayer({
        source: new VectorSource(),
        style: layerStyle,
      });
      map.addLayer(vectorLayer);
      dispatch({ type: actions.INITIALIZED, payload: { layer: vectorLayer } });
    };
  },
  doNsiAddStructures: (bbox) => {
    return async ({ store, dispatch }) => {
      const layer = store.selectNsiLayer();
      const source = layer.getSource();
      const geojson = await GetNSI(`structures?bbox=${bbox}`);
      source.addFeatures(new GeoJSON().readFeatures(geojson));
    };
  },
  reactNsiShouldInit: (state) => {
    if (state.nsi._shouldInit) return { actionCreator: "doNsiInitialize" };
  },
};

async function GetNSI(endpoint) {
  const url = `api/${endpoint}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  const geojson = await response.json();
  return geojson;
}

// structures?bbox=-81.58418,30.25165,-81.58161,30.26939,-81.55898,30.26939,-81.55281,30.24998,-81.58418,30.25165

import GeoJSON from "ol/format/GeoJSON.js";
import VectorSource from "ol/source/Vector.js";

import { actions as mapActions } from "./map-bundle.js";
import VectorLayer from "ol/layer/Vector.js";
import { makeClusterStyler } from "../styles/cluster-style-factory.js";

export const actions = {
  INITIALIZED_START: "NSI_INITIALIZED_START",
  INITIALIZED: "NSI_INITIALIZED",
};

export default {
  name: "nsi",
  getReducer: () => {
    const initialState = { _shouldInit: false, layer: null };
    return (state = initialState, { type, payload }) => {
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
    return ({ dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const vectorSource = new VectorSource();
      const layer = new VectorLayer({
        source: vectorSource,
        style: makeClusterStyler({
          property: "st_damcat",
          colorForValue: () => "#2E86DE",
        }),
        visible: false,
      });
      map.addLayer(layer);
      dispatch({
        type: actions.INITIALIZED,
        payload: { layer: layer },
      });
    };
  },
  doNsiAddStructures: (bbox) => {
    return async ({ store }) => {
      const source = store.selectNsiLayer().getSource();
      const geojson = await GetNSI(`structures?bbox=${bbox}`);
      source.addFeatures(new GeoJSON().readFeatures(geojson));
    };
  },
  reactNsiShouldInit: (state) => {
    if (state.nsi._shouldInit) return { actionCreator: "doNsiInitialize" };
  },
};

export async function GetNSI(endpoint) {
  const url = `api/${endpoint}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  const geojson = await response.json();
  return geojson;
}

// structures?bbox=-81.58418,30.25165,-81.58161,30.26939,-81.55898,30.26939,-81.55281,30.24998,-81.58418,30.25165

import GeoJSON from "ol/format/GeoJSON.js";
import VectorSource from "ol/source/Vector.js";

import { actions as mapActions } from "./map-bundle.js";

export const actions = {
  INITIALIZED_START: "NSI_INITIALIZED_START",
  INITIALIZED: "NSI_INITIALIZED",
};

export default {
  name: "nsi",
  getReducer: () => {
    const initialState = { _shouldInit: false, source: null };
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
  selectNsiSource: (state) => {
    return state.nsi.source;
  },
  doNsiInitialize: () => {
    return ({ dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      dispatch({
        type: actions.INITIALIZED,
        payload: { source: new VectorSource() },
      });
    };
  },
  doNsiAddStructures: (bbox) => {
    return async ({ store }) => {
      const source = store.selectNsiSource();
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

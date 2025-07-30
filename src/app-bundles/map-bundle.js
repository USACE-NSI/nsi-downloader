import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { useGeographic } from "ol/proj";

const actions = { INITIALIZED: "MAP_INITIALIZED" };

export default {
  name: "map",
  getReducer: () => {
    const initialState = { map: undefined };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case actions.INITIALIZED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectMapMap: (state) => {
    return state.map.map;
  },
  doMapInitialize: (target) => {
    return ({ store, dispatch }) => {
      if (!store.selectMapMap()) {
        const map = new Map({
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
          ],
          target: target,
          view: new View({
            center: [0, 0],
            zoom: 2,
          }),
        });
        useGeographic(); // NSI is in EPSG 4326
        dispatch({ type: actions.INITIALIZED, payload: { map: map } });
      }
    };
  },
};

export { actions };

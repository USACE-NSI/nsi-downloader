import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { useGeographic, fromLonLat } from "ol/proj";

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
            center: fromLonLat([-122.4194, 37.7749]),
            zoom: 14,
          }),
        });
        const view = map.getView();
        const handleZoomChange = () => {
          const zoom = view.getZoom();
          console.log("Current zoom level:", zoom);
        };

        view.on("change:resolution", handleZoomChange);
        useGeographic(); // NSI is in EPSG 4326
        dispatch({ type: actions.INITIALIZED, payload: { map: map } });
      }
    };
  },
};

export { actions };

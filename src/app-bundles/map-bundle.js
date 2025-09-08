import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { Point } from "ol/geom";
import { useGeographic, fromLonLat } from "ol/proj";

const actions = {
  INITIALIZED: "MAP_INITIALIZED",
  TOOLTIP_SET: "MAP_TOOLTIP_SET",
};
const Z_SWITCH = 16;

export default {
  name: "map",
  getReducer: () => {
    const initialState = {
      map: undefined,
      tooltip: { text: "", visible: false, left: 0, top: 0 },
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case actions.INITIALIZED:
          return { ...state, map: payload.map };
        case actions.TOOLTIP_SET:
          return {
            ...state,
            tooltip: { ...state.tooltip, ...payload.tooltip },
          };
        default:
          return state;
      }
    };
  },
  selectMapMap: (state) => {
    return state.map.map;
  },
  selectMapTooltip: (state) => {
    return state.map.tooltip;
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
            center: fromLonLat([-122.4444, 37.7749]),
            zoom: 14,
          }),
        });
        const view = map.getView();
        updateLayerVisibility(store, view.getZoom() ?? 0);

        view.on("change:resolution", () => {
          updateLayerVisibility(store, view.getZoom());
        });
        useGeographic(); // NSI is in EPSG 4326

        dispatch({ type: actions.INITIALIZED, payload: { map: map } });
      }
    };
  },
  doMapSetTooltip: () => {
    return ({ store, dispatch }) => {
      if (store.selectMapMap()) {
        const map = store.selectMapMap();
        let currentFeature = null;
        function displayFeatureInfo(pixel, target) {
          if (target.closest(".ol-control")) return;
          const feature = map.forEachFeatureAtPixel(pixel, (feat) => feat);
          if (feature && feature.get(store.selectInfoSelectedProperty())) {
            // only update if different feature
            if (feature !== currentFeature) {
              const coord = pixel;
              const name =
                feature.get(store.selectInfoSelectedProperty()) || "";
              dispatch({
                type: actions.TOOLTIP_SET,
                payload: {
                  tooltip: {
                    text: name,
                    visible: true,
                    left: coord[0] + "px",
                    top: coord[1] + "px",
                  },
                },
              });
            }
          } else {
            dispatch({
              type: actions.TOOLTIP_SET,
              payload: { tooltip: { visible: false } },
            });
          }
          currentFeature = feature;
        }

        map.on("pointermove", (evt) => {
          if (evt.dragging) {
            dispatch({
              type: actions.TOOLTIP_SET,
              payload: { tooltip: { visible: false } },
            });
            currentFeature = null;
            return;
          }
          displayFeatureInfo(evt.pixel, evt.originalEvent.target);
        });

        map.on("click", (evt) => {
          displayFeatureInfo(evt.pixel, evt.originalEvent.target);
        });

        // hide on exit
        const targetEl = map.getTargetElement();
        function onPointerLeave() {
          currentFeature = null;
          dispatch({
            type: actions.TOOLTIP_SET,
            payload: { tooltip: { visible: false } },
          });
        }
        targetEl.addEventListener("pointerleave", onPointerLeave);
      }
    };
  },
};

function updateLayerVisibility(store, zoom) {
  const nsiLayer = store.selectNsiLayer(); // may be undefined
  const clusterLayer = store.selectClusterLayer(); // may be undefined

  if (nsiLayer) nsiLayer.setVisible(zoom >= Z_SWITCH);
  if (clusterLayer) clusterLayer.setVisible(zoom < Z_SWITCH);
}

export { actions };

import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import GeoJSON from "ol/format/GeoJSON.js";
import { Style, Fill, Stroke } from "ol/style";
import { toLonLat } from "ol/proj";
import { actions as mapActions } from "./map-bundle.js";

const geojsonFormat = new GeoJSON();

export const actions = {
  INITIALIZED_START: "DRAW_INITIALIZED_START",
  INITIALIZED: "DRAW_INITIALIZED",
  STARTED: "DRAW_STARTED",
  FINISHED: "DRAW_FINISHED",
  CLEARED: "DRAW_CLEARED",
  VISIBILITY_SET: "DRAW_VISIBILITY_SET",
};

export default {
  name: "draw",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      layer: null,
      source: null,
      drawing: false,
      visible: true,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case mapActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
        case actions.STARTED:
        case actions.FINISHED:
        case actions.CLEARED:
        case actions.VISIBILITY_SET:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectDrawLayer: (state) => state.draw.layer,
  selectDrawSource: (state) => state.draw.source,
  selectDrawDrawing: (state) => state.draw.drawing,
  selectDrawVisible: (state) => state.draw.visible,
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
        store.doNsiAddBbox([bbox]);
        dispatch({ type: actions.FINISHED, payload: { drawing: false } });
      });
      dispatch({ type: actions.STARTED, payload: { drawing: true } });
    };
  },
  doDrawAddPolygons: (geojson) => {
    return ({ store }) => {
      const map = store.selectMapMap();
      const polySource = store.selectDrawSource();
      if (!map || !polySource) return;
      const features = geojsonFormat.readFeatures(geojson, {
        dataProjection: "EPSG:4326",
        featureProjection: map.getView().getProjection(),
      });
      polySource.addFeatures(features);
      if (features.length > 0) {
        map.getView().fit(polySource.getExtent(), {
          padding: [40, 40, 40, 40],
          duration: 300,
        });
      }
    };
  },
  doDrawClear: () => {
    return ({ store, dispatch }) => {
      const polySource = store.selectDrawSource();
      if (polySource) polySource.clear();
      dispatch({
        type: actions.CLEARED,
        payload: { drawing: false },
      });
    };
  },
  doDrawSetVisible: (visible) => {
    return ({ store, dispatch }) => {
      const layer = store.selectDrawLayer();
      if (layer) layer.setVisible(visible);
      dispatch({ type: actions.VISIBILITY_SET, payload: { visible } });
    };
  },
  reactDrawShouldInit: (state) => {
    if (state.draw._shouldInit) return { actionCreator: "doDrawInitialize" };
  },
};

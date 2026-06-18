import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Style from "ol/style/Style.js";
import Circle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import shp from "shpjs";
import { actions as mapActions } from "./map-bundle.js";
import { actions as drawActions } from "./draw-bundle.js";

// Polygons go in a POSTed GeoJSON body, not the URL: dense shapefile rings
// overflow the request line on a GET and the API rejects them with HTTP 431.
const NSI_URL = "/api/structures?fmt=fc";

// Rebuild a GeoJSON polygon from a "lon,lat,lon,lat,…" ring string.
function ringToFeatureCollection(ring) {
  const nums = ring.split(",").map(Number);
  const coordinates = [];
  for (let i = 0; i < nums.length; i += 2) {
    coordinates.push([nums[i], nums[i + 1]]);
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [coordinates] },
      },
    ],
  };
}

const stroke = new Stroke({ color: "#000", width: 1 });
const defaultStyle = new Style({
  image: new Circle({
    radius: 4,
    fill: new Fill({ color: "#2d96ff" }),
    stroke,
  }),
});

const geojsonFormat = new GeoJSON();

export const actions = {
  INITIALIZED_START: "NSI_INITIALIZED_START",
  INITIALIZED: "NSI_INITIALIZED",
  LOAD_STARTED: "NSI_LOAD_STARTED",
  LOAD_FINISHED: "NSI_LOAD_FINISHED",
  LOAD_ERRORED: "NSI_LOAD_ERRORED",
  BBOX_ADD: "NSI_BBOX_ADD",
  CLEARED: "NSI_CLEARED",
};

export default {
  name: "nsi",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      _shouldClear: false,
      layer: null,
      bbox: [],
      featureCount: 0,
      loading: false,
      loadError: null,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case mapActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case actions.BBOX_ADD:
          return { ...state, bbox: [...state.bbox, ...payload.rings] };
        case drawActions.CLEARED:
          return { ...state, _shouldClear: true, bbox: [] };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
        case actions.LOAD_STARTED:
        case actions.LOAD_FINISHED:
        case actions.LOAD_ERRORED:
        case actions.CLEARED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectNsiLayer: (state) => state.nsi.layer,
  selectNsiBbox: (state) => state.nsi.bbox,
  selectNsiFeatureCount: (state) => state.nsi.featureCount,
  selectNsiLoading: (state) => state.nsi.loading,
  selectNsiLoadError: (state) => state.nsi.loadError,
  doNsiAddBbox: (rings) => ({ type: actions.BBOX_ADD, payload: { rings } }),
  // Parse a zipped shapefile into query polygons. Shared by the toolbar upload
  // button and drag-and-drop onto the map.
  doNsiLoadShapezip: (file) => {
    return async ({ store }) => {
      if (!file) return;
      try {
        const geojson = await shp(await file.arrayBuffer());
        const nsiBbox = store.selectNsiBbox();

        // skip rings already in bbox so re-adding the same shapezip is a no-op.
        const newFeatures = [];
        const newRings = [];
        for (const feature of geojson.features) {
          // coordinates[0] is the outer ring: array of [lon, lat]
          const coords = feature.geometry.coordinates[0];
          const ring = coords.map(([lon, lat]) => `${lon},${lat}`).join(",");
          if (nsiBbox.includes(ring) || newRings.includes(ring)) continue;
          newRings.push(ring);
          newFeatures.push(feature);
        }
        if (newRings.length === 0) return;

        // TODO: validate polygons (turf) before adding
        store.doNsiAddBbox(newRings);
        store.doDrawAddPolygons({
          type: "FeatureCollection",
          features: newFeatures,
        });
      } catch (err) {
        console.error("Failed to read shapefile:", err);
      }
    };
  },
  doNsiInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const source = new VectorSource({
        attributions: "USACE",
        format: new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: map.getView().getProjection(),
        }),
      });
      const layer = new VectorLayer({
        declutter: true,
        source,
        style: defaultStyle,
      });
      map.addLayer(layer);
      dispatch({ type: actions.INITIALIZED, payload: { layer } });
    };
  },
  doNsiRefresh: () => {
    return async ({ store, dispatch }) => {
      const layer = store.selectNsiLayer();
      const bbox = store.selectNsiBbox();
      if (!layer || !bbox.length) return;
      const projection = store.selectMapMap().getView().getProjection();
      dispatch({
        type: actions.LOAD_STARTED,
        payload: { loading: true, loadError: null },
      });
      try {
        const polygonGeojsons = await Promise.all(
          bbox.map(async (ring) => {
            const res = await fetch(NSI_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ringToFeatureCollection(ring)),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          }),
        );

        // dedup if we have overlapping polygons
        const byId = new Map();
        for (const json of polygonGeojsons) {
          const features = geojsonFormat.readFeatures(json, {
            dataProjection: "EPSG:4326",
            featureProjection: projection,
          });
          for (const f of features) byId.set(f.get("fd_id"), f);
        }

        const source = layer.getSource();
        source.clear();
        source.addFeatures([...byId.values()]);
        dispatch({
          type: actions.LOAD_FINISHED,
          payload: { loading: false, featureCount: byId.size },
        });
      } catch {
        dispatch({
          type: actions.LOAD_ERRORED,
          payload: { loading: false, loadError: "Failed to load features" },
        });
      }
    };
  },
  doNsiClear: () => {
    return ({ store, dispatch }) => {
      const layer = store.selectNsiLayer();
      if (layer) layer.getSource().clear();
      dispatch({
        type: actions.CLEARED,
        payload: { _shouldClear: false, featureCount: 0 },
      });
    };
  },
  doNsiDownload: (filename = "data.geojson") => {
    return ({ store }) => {
      const layer = store.selectNsiLayer();
      const features = layer ? layer.getSource().getFeatures() : [];
      if (!features.length) return;
      // Features live in the map projection; write them back out as EPSG:4326.
      const projection = store.selectMapMap().getView().getProjection();
      const geojson = geojsonFormat.writeFeaturesObject(features, {
        dataProjection: "EPSG:4326",
        featureProjection: projection,
      });
      const blob = new Blob([JSON.stringify(geojson, null, 2)], {
        type: "application/geo+json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  },
  reactNsiShouldInit: (state) => {
    if (state.nsi._shouldInit) return { actionCreator: "doNsiInitialize" };
  },
  reactNsiShouldClear: (state) => {
    if (state.nsi._shouldClear) return { actionCreator: "doNsiClear" };
  },
};

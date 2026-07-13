import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Style from "ol/style/Style.js";
import Circle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import shp from "shpjs";
import { toLonLat } from "ol/proj";
import { buffer, getWidth, getHeight } from "ol/extent";
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
  QUERY_TYPE_SET: "NSI_QUERY_TYPE_SET",
  FIPS_SET: "NSI_FIPS_SET",
  CLICK_SET: "NSI_CLICK_SET",
  CLEARED: "NSI_CLEARED",
};

// FCC block/find reverse-geocodes a lon/lat into State + County FIPS codes.
const FCC_URL = "/fcc/api/census/block/find?format=json";

// The single in-flight structures request, so Clear (or a newer query) can
// abort it and a stale response can never repopulate the layer after the fact.
let inflightController = null;

export default {
  name: "nsi",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      _shouldClear: false,
      layer: null,
      // "polygon" queries POST drawn/uploaded rings; "fips" GETs by state or
      // county FIPS code (2-digit = state, 5-digit = county).
      queryType: "polygon",
      bbox: [],
      fips: "",
      // Popup shown after a map click in FIPS mode: the clicked coordinate plus
      // the state/county the FCC lookup resolved it to (null when hidden).
      clickInfo: null,
      clickLoading: false,
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
        case actions.QUERY_TYPE_SET:
          // Switching modes dismisses any open click popup.
          return {
            ...state,
            queryType: payload.queryType,
            clickInfo: null,
            clickLoading: false,
          };
        case actions.FIPS_SET:
          return { ...state, fips: payload.fips };
        case actions.CLICK_SET:
          return { ...state, ...payload };
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
  selectNsiQueryType: (state) => state.nsi.queryType,
  selectNsiFips: (state) => state.nsi.fips,
  selectNsiClickInfo: (state) => state.nsi.clickInfo,
  selectNsiClickLoading: (state) => state.nsi.clickLoading,
  selectNsiFeatureCount: (state) => state.nsi.featureCount,
  selectNsiLoading: (state) => state.nsi.loading,
  selectNsiLoadError: (state) => state.nsi.loadError,
  doNsiAddBbox: (rings) => ({ type: actions.BBOX_ADD, payload: { rings } }),
  doNsiSetQueryType: (queryType) => {
    return ({ store, dispatch }) => {
      dispatch({ type: actions.QUERY_TYPE_SET, payload: { queryType } });
      // Hide the drawn polygons outside polygon mode without destroying them;
      // restore the user's show/hide preference when back in polygon mode.
      const layer = store.selectDrawLayer();
      if (layer) {
        layer.setVisible(queryType === "polygon" && store.selectDrawVisible());
      }
    };
  },
  doNsiSetFips: (fips) => ({ type: actions.FIPS_SET, payload: { fips } }),
  doNsiClearClick: () => ({
    type: actions.CLICK_SET,
    payload: { clickInfo: null, clickLoading: false },
  }),
  // Reverse-geocode a clicked map coordinate (map projection) into state/county
  // FIPS codes and open the selection popup at that spot.
  doNsiLookupFips: (coordinate) => {
    return async ({ dispatch }) => {
      const [lon, lat] = toLonLat(coordinate);
      const url = `${FCC_URL}&latitude=${lat}&longitude=${lon}`;
      // Show the popup at the click immediately with a loading state.
      dispatch({
        type: actions.CLICK_SET,
        payload: { clickInfo: { coordinate }, clickLoading: true },
      });
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // No county => click was outside the US (e.g. ocean); dismiss.
        if (data.status !== "OK" || !data.County?.FIPS) {
          dispatch({
            type: actions.CLICK_SET,
            payload: { clickInfo: null, clickLoading: false },
          });
          return;
        }
        // Block.FIPS is the 15-digit code; the finer levels are prefixes of it.
        // (state=2, county=5, tract=11, block group=12, block=15)
        const block = data.Block?.FIPS;
        dispatch({
          type: actions.CLICK_SET,
          payload: {
            clickLoading: false,
            clickInfo: {
              coordinate,
              stateFips: data.State.FIPS,
              stateName: data.State.name,
              countyFips: data.County.FIPS,
              countyName: data.County.name,
              tractFips: block ? block.slice(0, 11) : null,
              blockGroupFips: block ? block.slice(0, 12) : null,
              blockFips: block || null,
            },
          },
        });
      } catch (err) {
        console.error("FCC lookup failed:", err);
        dispatch({
          type: actions.CLICK_SET,
          payload: { clickInfo: null, clickLoading: false },
        });
      }
    };
  },
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
      // In FIPS mode a map click reverse-geocodes to a state/county picker.
      // In polygon mode the draw interactions own clicks, so we no-op.
      map.on("singleclick", (e) => {
        if (store.selectNsiQueryType() !== "fips") return;
        // Clicking a structure selects it (see selection-bundle); only run the
        // FIPS lookup when the click lands on empty map, not on a feature.
        const onFeature = map.hasFeatureAtPixel(e.pixel, {
          layerFilter: (lyr) => lyr === layer,
          hitTolerance: 5,
        });
        if (onFeature) return;
        store.doNsiLookupFips(e.coordinate);
      });
      dispatch({ type: actions.INITIALIZED, payload: { layer } });
    };
  },
  doNsiRefresh: () => {
    return async ({ store, dispatch }) => {
      const layer = store.selectNsiLayer();
      if (!layer) return;
      const queryType = store.selectNsiQueryType();
      const bbox = store.selectNsiBbox();
      const fips = store.selectNsiFips().trim();
      // Nothing to query yet for the active mode.
      if (queryType === "fips" ? !fips : !bbox.length) return;

      // A 2-digit FIPS is a state. State-level queries aren't scalable yet, so
      // reject them and surface the reason where other load errors show.
      if (queryType === "fips" && /^\d{2}$/.test(fips)) {
        dispatch({
          type: actions.LOAD_ERRORED,
          payload: {
            loading: false,
            loadError: "States are not currently supported",
          },
        });
        return;
      }
      const projection = store.selectMapMap().getView().getProjection();

      // Cancel any query already in flight so its response can't land after a
      // newer query or a Clear supersedes it.
      if (inflightController) inflightController.abort();
      const controller = new AbortController();
      inflightController = controller;
      const { signal } = controller;

      dispatch({
        type: actions.LOAD_STARTED,
        payload: { loading: true, loadError: null },
      });
      try {
        let responseGeojsons;
        if (queryType === "fips") {
          // FIPS is short enough to pass in the URL, so a plain GET is fine.
          const res = await fetch(
            `${NSI_URL}&fips=${encodeURIComponent(fips)}`,
            { signal },
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          responseGeojsons = [await res.json()];
        } else {
          responseGeojsons = await Promise.all(
            bbox.map(async (ring) => {
              const res = await fetch(NSI_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ringToFeatureCollection(ring)),
                signal,
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            }),
          );
        }

        // dedup if we have overlapping polygons
        const byId = new Map();
        for (const json of responseGeojsons) {
          const features = geojsonFormat.readFeatures(json, {
            dataProjection: "EPSG:4326",
            featureProjection: projection,
          });
          for (const f of features) byId.set(f.get("fd_id"), f);
        }

        const source = layer.getSource();
        source.clear();
        source.addFeatures([...byId.values()]);
        // Zoom to the returned features, mirroring the shapefile-import fit but
        // pulled back ~15% so the features don't hug the edges of the viewport.
        if (byId.size > 0) {
          const extent = source.getExtent();
          const pad = Math.max(getWidth(extent), getHeight(extent)) * 0.15;
          store.selectMapMap().getView().fit(buffer(extent, pad), {
            padding: [40, 40, 40, 40],
            duration: 300,
          });
        }
        dispatch({
          type: actions.LOAD_FINISHED,
          payload: { loading: false, featureCount: byId.size },
        });
      } catch (err) {
        // Aborted by Clear or a newer query: that caller owns the UI state, so
        // don't clobber it with a spurious error.
        if (signal.aborted || err.name === "AbortError") return;
        dispatch({
          type: actions.LOAD_ERRORED,
          payload: { loading: false, loadError: "Failed to load features" },
        });
      } finally {
        if (inflightController === controller) inflightController = null;
      }
    };
  },
  doNsiClear: () => {
    return ({ store, dispatch }) => {
      // Stop any in-flight query so its response can't repopulate the layer.
      if (inflightController) {
        inflightController.abort();
        inflightController = null;
      }
      const layer = store.selectNsiLayer();
      if (layer) layer.getSource().clear();
      dispatch({
        type: actions.CLEARED,
        payload: {
          _shouldClear: false,
          featureCount: 0,
          loading: false,
          loadError: null,
          clickInfo: null,
          clickLoading: false,
        },
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

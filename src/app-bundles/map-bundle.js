import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import XYZ from "ol/source/XYZ.js";
import TileArcGISRest from "ol/source/TileArcGISRest.js";
import { fromLonLat } from "ol/proj";

const actions = {
  INITIALIZED: "MAP_INITIALIZED",
  SET_BASEMAP: "MAP_SET_BASEMAP",
};

export const BASEMAP_CONFIG = {
  osm: {
    label: 'Streets',
    description: 'OpenStreetMap (ODbL)',
    type: 'osm',
  },
  usgs: {
    label: 'USGS',
    description: 'USGS National Map imagery (US, max zoom ~16)',
    type: 'xyz',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Imagery courtesy of the U.S. Geological Survey, The National Map',
    maxZoom: 16,
  },
  naip: {
    label: 'NAIP',
    description: 'USDA NAIP imagery (CONUS only)',
    type: 'arcgisrest',
    url: 'https://gis.apfo.usda.gov/arcgis/rest/services/NAIP/USDA_CONUS_PRIME/ImageServer',
    attributions: 'Imagery courtesy of the USDA NAIP / Aerial Photography Field Office',
  },
  sentinel: {
    label: 'Sentinel-2',
    description: "Sentinel-2 / World Imagery",
    type: 'xyz',
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  },
};

export default {
  name: "map",
  getReducer: () => {
    const initialState = {
      map: undefined,
      basemapLayer: undefined,
      basemap: "osm",
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case actions.INITIALIZED:
          return { ...state, map: payload.map, basemapLayer: payload.basemapLayer };
        case actions.SET_BASEMAP:
          return { ...state, basemap: payload.basemap };
        default:
          return state;
      }
    };
  },
  selectMapMap: (state) => state.map.map,
  selectMapBasemap: (state) => state.map.basemap,
  selectMapBasemapLayer: (state) => state.map.basemapLayer,

  doMapInitialize: (target) => {
    return ({ store, dispatch }) => {
      if (!store.selectMapMap()) {
        const basemapLayer = new TileLayer({ source: new OSM() });
        const map = new Map({
          layers: [basemapLayer],
          target,
          view: new View({
            center: fromLonLat([-122.4444, 37.7749]),
            zoom: 15,
          }),
        });
        dispatch({
          type: actions.INITIALIZED,
          payload: { map, basemapLayer },
        });
      }
    };
  },

  doSetMapBasemap: (basemapKey) => {
    return ({ store, dispatch }) => {
      const layer = store.selectMapBasemapLayer();
      if (!layer) return;

      const cfg = BASEMAP_CONFIG[basemapKey];
      if (!cfg) return;

      let source;
      switch (cfg.type) {
        case "osm":
          source = new OSM();
          break;
        case "xyz":
          source = new XYZ({
            url: cfg.url,
            attributions: cfg.attributions,
            maxZoom: cfg.maxZoom,
            crossOrigin: "anonymous",
          });
          break;
        case "arcgisrest":
          source = new TileArcGISRest({
            url: cfg.url,
            attributions: cfg.attributions,
            crossOrigin: "anonymous",
          });
          break;
        default:
          throw new Error(`Unknown basemap source type: ${cfg.type}`);
      }

      layer.setSource(source);
      dispatch({ type: actions.SET_BASEMAP, payload: { basemap: basemapKey } });
    };
  },
};

export { actions };
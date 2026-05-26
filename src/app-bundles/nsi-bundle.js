import GeoJSON from "ol/format/GeoJSON.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Style from "ol/style/Style.js";
import Circle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import { actions as mapActions } from "./map-bundle.js";

const NSI_URL =
  "/api/structures?bbox=-81.58418,30.25165,-81.58161,30.26939,-81.55898,30.26939,-81.55281,30.24998,-81.58418,30.25165";

const stroke = new Stroke({ color: "#000", width: 1 });
const styleRes = new Style({
  image: new Circle({ radius: 4, fill: new Fill({ color: "#2d96ff" }), stroke }),
});
const stylePub = new Style({
  image: new Circle({ radius: 4, fill: new Fill({ color: "#09e40f" }), stroke }),
});
const styleInd = new Style({
  image: new Circle({ radius: 4, fill: new Fill({ color: "#fa3232" }), stroke }),
});
const styleCom = new Style({
  image: new Circle({ radius: 4, fill: new Fill({ color: "#AAA" }), stroke }),
});

function damcatStyle(feature) {
  const damcat = feature.get("st_damcat");
  if (damcat === "RES") return styleRes;
  if (damcat === "PUB") return stylePub;
  if (damcat === "IND") return styleInd;
  return styleCom;
}

export const actions = {
  INITIALIZED_START: "NSI_INITIALIZED_START",
  INITIALIZED: "NSI_INITIALIZED",
};

export default {
  name: "nsi",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      layer: null,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case mapActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectNsiLayer: (state) => state.nsi.layer,
  doNsiInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const layer = new VectorLayer({
        declutter: true,
        source: new VectorSource({
          attributions: "USACE",
          url: NSI_URL,
          format: new GeoJSON({
            dataProjection: "EPSG:4326",
            featureProjection: map.getView().getProjection(),
          }),
        }),
        style: damcatStyle,
      });
      layer.getSource().on("featuresloadend", () => {
        for (const f of layer.getSource().getFeatures()) {
          if (f.getId() === undefined) {
            const fdId = f.get("fd_id");
            if (fdId !== undefined) f.setId(fdId);
          }
        }
      });
      map.addLayer(layer);
      dispatch({
        type: actions.INITIALIZED,
        payload: { layer: layer },
      });
    };
  },
  reactNsiShouldInit: (state) => {
    if (state.nsi._shouldInit) return { actionCreator: "doNsiInitialize" };
  },
};

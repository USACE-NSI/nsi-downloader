import { Cluster } from "ol/source.js";
import { actions as nsiActions } from "./nsi-bundle.js";
import VectorLayer from "ol/layer/Vector.js";
import { getNewStyle } from "../styles/nsi-styles.js";

const actions = {
  INITIALIZED_START: "CLUSTER_INITIALIZED_START",
  INITIALIZED: "CLUSTER_INITIALIZED",
};

export default {
  name: "cluster",
  getReducer: () => {
    const initialState = { _shouldInit: false, layer: null };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case nsiActions.INITIALIZED:
          return { ...state, ...{ _shouldInit: true } };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectClusterLayer: (state) => {
    return state.cluster.layer;
  },
  doClusterInitialize: () => {
    return async ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const vectorSource = store.selectNsiLayer().getSource();
      const clusterSource = new Cluster({
        distance: 60,
        source: vectorSource,
      });
      const clusters = new VectorLayer({
        source: clusterSource,
        style: getNewStyle(clusterSource, store.selectInfoSelectedProperty()),
        visible: true,
      });
      map.addLayer(clusters);
      dispatch({ type: actions.INITIALIZED, payload: { layer: clusters } });
    };
  },
  doClusterChangeStyle: (newProperty) => {
    return ({ store }) => {
      store
        .selectClusterLayer()
        .setStyle(
          getNewStyle(store.selectClusterLayer().getSource(), newProperty)
        );
    };
  },
  reactClusterShouldInit: (state) => {
    if (state.cluster._shouldInit && state.nsi.layer) {
      return { actionCreator: "doClusterInitialize" };
    }
  },
};

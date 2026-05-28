import { actions as nsiActions } from "./nsi-bundle.js";

export const actions = {
  INITIALIZED_START: "SELECTION_INITIALIZED_START",
  INITIALIZED: "SELECTION_INITIALIZED",
  FEATURE_SELECTED: "SELECTION_FEATURE_SELECTED",
};

export default {
  name: "selection",
  getReducer: () => {
    const initialState = { _shouldInit: false, properties: null, id: null };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case nsiActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case nsiActions.CLEARED:
          return { ...state, properties: null, id: null };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
        case actions.FEATURE_SELECTED:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectSelectionProperties: (state) => state.selection.properties,
  selectSelectionId: (state) => state.selection.id,
  doSelectionInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const layer = store.selectNsiLayer();
      if (!map || !layer) return;
      map.on("pointermove", (event) => {
        if (event.dragging) return;
        const hit = map.hasFeatureAtPixel(event.pixel, {
          layerFilter: (lyr) => lyr === layer,
          hitTolerance: 5,
        });
        map.getTargetElement().style.cursor = hit ? "pointer" : "";
      });
      map.on("singleclick", (event) => {
        let picked = null;
        map.forEachFeatureAtPixel(
          event.pixel,
          (f, lyr) => {
            if (lyr === layer) {
              picked = f;
              return true;
            }
            return false;
          },
          { hitTolerance: 5 }
        );
        if (picked) {
          const { geometry, ...rest } = picked.getProperties();
          dispatch({
            type: actions.FEATURE_SELECTED,
            payload: { properties: rest, id: picked.get("fd_id") ?? null },
          });
        } else {
          dispatch({
            type: actions.FEATURE_SELECTED,
            payload: { properties: null, id: null },
          });
        }
      });
      dispatch({ type: actions.INITIALIZED, payload: {} });
    };
  },
  doSelectionClear: () => ({
    type: actions.FEATURE_SELECTED,
    payload: { properties: null, id: null },
  }),
  reactSelectionShouldInit: (state) => {
    if (state.selection._shouldInit)
      return { actionCreator: "doSelectionInitialize" };
  },
};

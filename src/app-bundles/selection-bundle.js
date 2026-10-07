import { actions as nsiActions } from "./nsi-bundle.js";

export const actions = {
  INITIALIZED_START: "SELECTION_INITIALIZED_START",
  INITIALIZED: "SELECTION_INITIALIZED",
  FEATURE_SELECTED: "SELECTION_FEATURE_SELECTED",
  HOVER_SET: "SELECTION_HOVER_SET",
};

export default {
  name: "selection",
  getReducer: () => {
    const initialState = {
      _shouldInit: false,
      properties: null,
      id: null,
      hoverFeature: null,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case nsiActions.INITIALIZED:
          return { ...state, _shouldInit: true };
        case nsiActions.CLEARED:
          return { ...state, properties: null, id: null, hoverFeature: null };
        // A new query rebuilds the source without firing Clear, so the hovered
        // feature object stops existing while the pointer never moves.
        case nsiActions.LOAD_STARTED:
          return { ...state, hoverFeature: null };
        case actions.INITIALIZED_START:
        case actions.INITIALIZED:
        case actions.FEATURE_SELECTED:
        case actions.HOVER_SET:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectSelectionProperties: (state) => state.selection.properties,
  selectSelectionId: (state) => state.selection.id,
  selectSelectionHoverFeature: (state) => state.selection.hoverFeature,
  doSelectionInitialize: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.INITIALIZED_START,
        payload: { _shouldInit: false },
      });
      const map = store.selectMapMap();
      const layer = store.selectNsiLayer();
      if (!map || !layer) return;
      // One hit-test serves both affordances: the pointer cursor and the
      // single-property hover tooltip. Dispatch only when the hovered feature
      // changes identity — pointermove fires per pixel, and a store update on
      // each one re-renders the panel for nothing.
      map.on("pointermove", (event) => {
        if (event.dragging) return;
        const picked =
          map.forEachFeatureAtPixel(
            event.pixel,
            (f, lyr) => (lyr === layer ? f : null),
            { hitTolerance: 5 },
          ) ?? null;
        map.getTargetElement().style.cursor = picked ? "pointer" : "";
        if (picked !== store.selectSelectionHoverFeature()) {
          dispatch({
            type: actions.HOVER_SET,
            payload: { hoverFeature: picked },
          });
        }
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

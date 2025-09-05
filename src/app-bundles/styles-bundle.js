import { INITIAL_DAMCAT_COLORS } from "../styles/structure-styles/damcat-styles";

const actions = {
  NEW_DAMCAT: "STYLES_NEW_DAMCAT",
  NEW_VALSTRUCT: "STYLES_NEW_VALSTRUCT",
  NEW_NUMSTORY: "STYLES_NEW_NUMSTORY",
};

export default {
  name: "styles",
  getReducer: () => {
    const initialState = {
      damcatColors: INITIAL_DAMCAT_COLORS,
      valstructMap: null,
      numstoryMap: null,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case actions.NEW_DAMCAT:
          return { ...state, damcatColors: payload.newStyle };
        case actions.NEW_VALSTRUCT:
          return { ...state, valstructMap: payload.newStyle };
        case actions.NEW_NUMSTORY:
          return { ...state, numstoryMap: payload.newStyle };
        default:
          return state;
      }
    };
  },
  selectStylesDamcatColors: (state) => state.styles.damcatColors,
  selectStylesValstructMap: (state) => state.styles.valstructMap,
  selectStylesNumstoryMap: (state) => state.styles.numstoryMap,

  doUpdateStyle: (property, newStyle) => {
    return ({ dispatch }) => {
      //console.log(property, newStyle);
      switch (property) {
        case "st_damcat":
          dispatch({ type: actions.NEW_DAMCAT, payload: { newStyle } });
          break;
        case "val_struct":
          dispatch({ type: actions.NEW_VALSTRUCT, payload: { newStyle } });
          break;
        case "num_story":
          dispatch({ type: actions.NEW_NUMSTORY, payload: { newStyle } });
          break;
        default:
          dispatch({ type: "FAILED", payload: {} });
          break;
      }
    };
  },
};

const actions = {
  CHANGED_SELECTED_PROPERTY: "INFO_CHANGED_SELECTED_PROPERTY",
  UPDATED_NUM_STRUCTURES: "INFO_UPDATED_NUM_STRUCTURES",
};

export default {
  name: "info",
  getReducer: () => {
    const initialState = { selectedProperty: "st_damcat", numStructures: "-" };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case actions.CHANGED_SELECTED_PROPERTY:
          return { ...state, selectedProperty: payload.newProperty };
        case actions.UPDATED_NUM_STRUCTURES:
          return { ...state, numStructures: payload.numStructures };
        default:
          return state;
      }
    };
  },
  selectInfoSelectedProperty: (state) => state.info.selectedProperty,
  selectInfoNumStructures: (state) => state.info.numStructures,
  doInfoChangeSelectedProperty: (newProperty) => {
    return ({ dispatch }) => {
      dispatch({
        type: actions.CHANGED_SELECTED_PROPERTY,
        payload: { newProperty },
      });
    };
  },
  doInfoUpdateNumStructures: (numStructures) => {
    return ({ dispatch }) => {
      dispatch({
        type: actions.UPDATED_NUM_STRUCTURES,
        payload: { numStructures },
      });
    };
  },
};

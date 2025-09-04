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
          return { ...state, selectedProperty: payload.prop };
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
    return ({ store, dispatch }) => {
      store.doClusterChangeStyle(newProperty);
      store.doNsiChangeStyle(newProperty);
      dispatch({
        type: actions.CHANGED_SELECTED_PROPERTY,
        payload: { prop: newProperty },
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

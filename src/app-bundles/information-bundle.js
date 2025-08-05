const actions = {
  CHANGED_SELECTED_PROPERTY: "INFO_CHANGED_SELECTED_PROPERTY",
};

export default {
  name: "info",
  getReducer: () => {
    const initialState = { selectedProperty: "st_damcat" };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case actions.CHANGED_SELECTED_PROPERTY:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectInfoSelectedProperty: (state) => state.info.selectedProperty,
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
};

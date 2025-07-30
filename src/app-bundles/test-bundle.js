export default {
  name: "test",
  getReducer: () => {
    const initialData = { info: "jack", count: 0 };
    return (state = initialData, { type, payload }) => {
      switch (type) {
        case "TEST_UPDATE":
          return { ...state, ...payload }; // payload keys will overwrite any matching state keys
        case "TEST_INCREMENT":
          return { ...state, count: state.count + (payload?.amount ?? 1) };
        case "TEST_RESET":
          return { ...state, count: 0 };
        default:
          return state;
      }
    };
  },
  selectTestInfo: (state) => {
    // store state
    return state.test.info;
  },
  selectTestCount: (state) => {
    return state.test.count;
  },
  doTestChangeInfo: (newInfo) => {
    return ({ store, dispatch }) => {
      dispatch({ type: "TEST_UPDATE", payload: { info: newInfo } }); // dispatch an action
    };
  },
  doTestIncrement: (incrAmount = 1) => {
    return ({ dispatch }) => {
      dispatch({ type: "TEST_INCREMENT", payload: { amount: incrAmount } });
    };
  },
  doTestReset: () => {
    return ({ dispatch }) => {
      dispatch({ type: "TEST_RESET" });
    };
  },
  persistActions: ["TEST_INCREMENT"],
};

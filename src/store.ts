import createStore from "teaful";

const initialStore = {
  sevenths: true,
  relative: false,
};

export const { useStore, getStore } = createStore(initialStore);

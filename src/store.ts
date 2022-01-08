import createStore from "teaful";

const initialStore = {
  sevenths: true,
};

export const { useStore, getStore } = createStore(initialStore);

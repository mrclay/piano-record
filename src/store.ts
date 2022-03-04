import createStore from "teaful";
import Recorder from "./Recorder";

const initialStore = {
  recorder: new Recorder(),
  chordSet: {},
  song: "",
  offset: 0,
};

export const { useStore, getStore } = createStore(initialStore);

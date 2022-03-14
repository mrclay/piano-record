import { ReactNode } from "react";
import createStore from "teaful";
import Recorder from "./Recorder";

const SPEED_KEY = "CC-speed";

const initialStore = {
  recorder: new Recorder(),
  chordSet: {},
  song: "",
  songChords: undefined as ReactNode | undefined,
  offset: 0,
  pianoSpeed: Number(sessionStorage.getItem(SPEED_KEY) || "100"),
};

export const { useStore, getStore } = createStore(
  initialStore,
  ({ store, prevStore }) => {
    if (store.pianoSpeed !== prevStore.pianoSpeed) {
      sessionStorage.setItem(SPEED_KEY, store.pianoSpeed + "");
    }
  }
);

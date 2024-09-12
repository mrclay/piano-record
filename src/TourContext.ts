import { Chord } from "./common-chords/ChordSet";
import { createContext, useReducer } from "react";

interface TourItem {
  setKey: string;
  chord: Chord;
}

interface TourState {
  items: TourItem[];
  active: boolean;
  activeIdx: number;
  done: boolean;
  playing: boolean;
}

const initState: TourState = {
  items: [],
  active: false,
  activeIdx: 0,
  done: false,
  playing: false,
};

type TourAction = { type: "next" } | { type: "reset" } | { type: "start" };

function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case "reset":
      return structuredClone(initState);

    case "next":
      let activeIdx = state.activeIdx + 1;
      const done = activeIdx >= state.items.length;
      return { ...state, activeIdx, done, active: !done };

    case "start":
      return { ...initState, active: true };
  }
}

// Cheating a bit, we're going to amend the state object in place because
// we don't want to trigger a rerender.
export function pushTourItems(
  items: TourItem[],
  setKey: string,
  chords: Chord[]
) {
  items.push(
    ...chords.filter(chord => chord.songUrl).map(chord => ({ setKey, chord }))
  );
}

export function useTour() {
  const [tourState, tourDispatch] = useReducer(tourReducer, initState);

  return { tourState, tourDispatch };
}

export const TourContext = createContext({
  tourState: initState,
  activeItem: initState.active ? initState.items[0] : null,
  tourDispatch(action: TourAction) {},
});

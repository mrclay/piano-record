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

type TourAction =
  | { type: "next" }
  | { type: "reset" }
  | { type: "start" }
  | { type: "start-random" };

function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case "reset":
      return { ...initState, items: [] };

    case "next":
      let activeIdx = state.activeIdx + 1;
      const done = activeIdx >= state.items.length;
      return { ...state, activeIdx, done, active: !done };

    case "start":
      return { ...state, active: true };

    case "start-random":
      shuffleArray(state.items);
      return { ...state, active: true };
  }
}

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
}

// Cheating a bit, we're going to amend the state object in place because
// we don't want to trigger a rerender.
export function pushTourItems(
  items: TourItem[],
  setKey: string,
  chords: Chord[],
) {
  if (items.some(item => item.setKey === setKey)) {
    // Already added.
    return;
  }

  items.push(
    ...chords.filter(chord => chord.songUrl).map(chord => ({ setKey, chord })),
  );
}

export function useTour() {
  const [tourState, tourDispatch] = useReducer(tourReducer, initState);

  return { tourState, tourDispatch };
}

export const TourContext = createContext({
  tourState: initState,
  activeItem: initState.active ? initState.items[0] : null,
  tourDispatch: (() => 0) as (action: TourAction) => void,
});

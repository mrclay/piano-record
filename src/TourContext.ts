import { Chord } from "./common-chords/ChordSet";
import { createContext } from "react";

export interface TourSet {
  active: boolean;
  key: string;
  done: boolean;
  chords: Record<
    string,
    {
      key: string;
      chord: Chord;
      done: boolean;
    }
  >;
}

export type Tour = Record<string, TourSet>;

export const TourContext = createContext({
  tour: {} as Tour,
  updateTour() {},
});

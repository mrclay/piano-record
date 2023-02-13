import { ReactNode } from "react";
import { atom, useAtom, Atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Recorder from "./Recorder";
import Piano from "./Piano";
import NullPlayer from "./players/NullPlayer";
import { availableInstruments, Playable, SoundFont } from "./players";

const SPEED_KEY = "CC-speed";
const INSTR_KEY = "CC-instr";

type AtomSet<T = {}> = {
  [Property in keyof T]: Atom<T[Property]>;
};
type HookSet<T = {}> = {
  [Property in keyof T]: () => [
    T[Property],
    (val: T[Property] | ((prev: T[Property]) => T[Property])) => void
  ];
};

const nullPlayer: Playable = new NullPlayer();
const defaultPiano = new Piano(nullPlayer);

export interface PlayerSpec {
  sf: SoundFont;
  name: string;
}

export const atoms = {
  player: atom(nullPlayer),
  playerLoading: atom(false),
  piano: atom(defaultPiano),
  recorder: atom(new Recorder({ piano: defaultPiano })),
  chordSet: atom({} as object),
  song: atom(""),
  songChords: atom(undefined as ReactNode | undefined),
  offset: atom(0),
  playerSpec: atomWithStorage<PlayerSpec>(INSTR_KEY, {
    sf: SoundFont.TonePiano,
    name: availableInstruments[SoundFont.TonePiano]![0],
  }),
  pianoSpeed: atomWithStorage(SPEED_KEY, 100),
};

function createUseStoreHook<T>(atomSet: AtomSet<T>) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(atomSet).map(([k, v]) => [k, () => useAtom(v)])
  ) as unknown as HookSet<T>;
}

export const useStore = createUseStoreHook(atoms);

import { ReactNode } from "react";
import { atom, useAtom, Atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Recorder from "./Recorder";

const SPEED_KEY = "CC-speed";

type AtomSet<T = {}> = {
  [Property in keyof T]: Atom<T[Property]>;
};
type HookSet<T = {}> = {
  [Property in keyof T]: () => [
    T[Property],
    (val: T[Property] | ((prev: T[Property]) => T[Property])) => void
  ];
};

export const atoms = {
  recorder: atom(new Recorder()),
  chordSet: atom({} as object),
  song: atom(""),
  songChords: atom(undefined as ReactNode | undefined),
  offset: atom(0),
  pianoSpeed: atomWithStorage(SPEED_KEY, 100),
};

function createUseStoreHook<T>(atomSet: AtomSet<T>) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(atomSet).map(([k, v]) => [k, () => useAtom(v)])
  ) as unknown as HookSet<T>;
}

export const useStore = createUseStoreHook(atoms);

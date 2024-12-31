import { ReactNode } from "react";
import { atom, useAtom, Atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Recorder from "./Recorder";
import Piano from "./Piano";
import NullPlayer from "./players/NullPlayer";
import { availableInstruments, Playable, SoundFont } from "./players";
import { Sequencer } from "./Sequencer";

const SPEED_KEY = "CC-speed";

type AtomSet<T = {}> = {
  [Property in keyof T]: Atom<T[Property]>;
};
type HookSet<T = {}> = {
  [Property in keyof T]: () => [
    T[Property],
    (val: T[Property] | ((prev: T[Property]) => T[Property])) => void,
  ];
};

const nullPlayer: Playable = new NullPlayer();
const defaultPiano = new Piano(nullPlayer);

export interface PlayerSpec {
  sf: SoundFont;
  name: string;
  midiProgram: number;
}

export const pianoSpec: PlayerSpec = {
  sf: SoundFont.TonePiano,
  name: availableInstruments[SoundFont.TonePiano]![0],
  midiProgram: 1,
};

export function playerSpecFromUrl(): PlayerSpec | undefined {
  let params = new URLSearchParams(window.location.search);

  if (window.location.pathname.includes("/piano/embed")) {
    const url = params.get("url");
    if (url) {
      params = new URL(url).searchParams;
    }
  }

  const [sf, name] = (params.get("sf") || ".").split(".");

  const available = availableInstruments[sf as SoundFont];
  if (!available) {
    return;
  }

  const idx = available.indexOf(name);
  if (idx !== -1) {
    return { sf: sf as SoundFont, name, midiProgram: idx + 1 };
  }
}

export const atoms = {
  player: atom(nullPlayer),
  playerLoading: atom(false),
  piano: atom(defaultPiano),
  recorder: atom(new Recorder({ piano: defaultPiano })),
  chordSet: atom({} as object),
  sequencer: atom(new Sequencer(defaultPiano)),
  song: atom(""),
  songChords: atom(undefined as ReactNode | undefined),
  offset: atom(0),
  playerSpec: atom(playerSpecFromUrl() || pianoSpec),
  pianoSpeed: atomWithStorage(SPEED_KEY, 100),
};

function createUseStoreHook<T>(atomSet: AtomSet<T>) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(atomSet).map(([k, v]) => [k, () => useAtom(v)]),
  ) as unknown as HookSet<T>;
}

export const useStore = createUseStoreHook(atoms);

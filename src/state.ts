import { availableInstruments, SoundFont } from "~/players";

// const SPEED_KEY = "CC-speed";

export interface PlayerSpec {
  sf: SoundFont;
  name: string;
}

export const pianoSpec: PlayerSpec = {
  sf: SoundFont.TonePiano,
  name: availableInstruments[SoundFont.TonePiano]![0],
};

export function playerSpecFromUrl(): PlayerSpec | undefined {
  const params = new URLSearchParams(window.location.search);
  const [sf, name] = (params.get("sf") || ".").split(".");

  const available = availableInstruments[sf as SoundFont];
  if (available && available.includes(name)) {
    return { sf: sf as SoundFont, name };
  }
}

export const initState = {
  playerLoading: false,
  //recorder: new Recorder({ piano: defaultPiano }),
  chordSet: {} as object,
  song: "",
  //songChords: undefined as ReactNode | undefined,
  offset: 0,
  playerSpec: pianoSpec,
  pianoSpeed: 100, //atomWithStorage(SPEED_KEY, 100),
};

export type State = typeof initState;

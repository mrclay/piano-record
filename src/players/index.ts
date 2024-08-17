import { InstrumentName, instrument as getInstrument } from "soundfont-player";

import * as C from "../constants";
import FatBoy_names from "../sf/FatBoy/names.json";
import FluidR3_GM_names from "../sf/FluidR3_GM/names.json";
import MusyngKite_names from "../sf/MusyngKite/names.json";
import Mellotron_names from "../sf/Mellotron/names.json";
import TonePiano_names from "../sf/TonePiano/names.json";
import { ActiveKeys } from "../Piano";
import NullPlayer from "./NullPlayer";
import { SAMPLES_URL } from "../constants";

export enum SoundFont {
  FatBoy = "FatBoy",
  FluidR3_GM = "FluidR3_GM",
  MusyngKite = "MusyngKite",
  TonePiano = "TonePiano",
  Mellotron = "Mellotron",
  Null = "Null",
}

export interface Playable {
  keyDown(args: { midi: number; velocity: number }): void;
  keyUp(args: { midi: number }): void;
  pedalDown(): void;
  pedalUp(): void;
  stopAll(): void;
}

export const availableInstruments: Record<
  SoundFont,
  ReadonlyArray<string> | undefined
> = {
  [SoundFont.FatBoy]: FatBoy_names,
  [SoundFont.FluidR3_GM]: FluidR3_GM_names,
  [SoundFont.MusyngKite]: MusyngKite_names,
  [SoundFont.TonePiano]: TonePiano_names,
  [SoundFont.Mellotron]: Mellotron_names,
  [SoundFont.Null]: [],
};

const ctx = new AudioContext();

const simpleUrls: Record<
  string,
  undefined | { url(inst: string): string; volume: number }
> = {
  TonePiano: {
    url: (inst: string) => `${SAMPLES_URL}tone-piano/${inst}.json`,
    volume: -6,
  },
  Mellotron: {
    url: (inst: string) => `${SAMPLES_URL}mellotron/${inst}.mp3.json`,
    volume: -12,
  },
};

export async function createPlayer(
  soundfont: SoundFont,
  instrument: string,
  microtone: number
): Promise<Playable | null> {
  if (soundfont === "Null") {
    return new NullPlayer();
  }

  const available = availableInstruments[soundfont];
  if (!available || !available.includes(instrument)) {
    return null;
  }

  const simple = simpleUrls[soundfont];
  if (simple) {
    const SimplePiano = (await import("./SimplePiano")).default;
    const url = simple.url(instrument);
    return SimplePiano.fromJsonUrl(url, simple.volume, microtone);
  }

  const [SFPlayer, sound] = await Promise.all([
    import("./SFPlayer").then(module => module.default),
    getInstrument(ctx, instrument as InstrumentName, { soundfont }),
  ]);
  return new SFPlayer(sound);
}

export function isShepardToneActive(midi: number, activeKeys: ActiveKeys) {
  let check = midi % 12;
  while (check <= C.RANGE[1]) {
    if (activeKeys.has(check)) {
      return true;
    }
    check += 12;
  }
  return false;
}

export function getShepardTones(midi: number) {
  const zeroToEleven = midi % 12;
  // Added 1 to reduce volume a bit.
  let divisor = 24 + 3;
  let midiOffset = -12;

  return [
    {
      midi: 48 + zeroToEleven,
      velocityNumerator: zeroToEleven,
    },
    {
      midi: 60 + zeroToEleven,
      velocityNumerator: 12 + zeroToEleven,
    },
    {
      midi: 72 + zeroToEleven,
      velocityNumerator: 12 + (12 - zeroToEleven),
    },
    {
      midi: 84 + zeroToEleven,
      velocityNumerator: 12 - zeroToEleven,
    },
  ]
    .filter(el => el.velocityNumerator > 0)
    .map(({ midi, velocityNumerator }) => ({
      midi: midi + midiOffset,
      velocity: velocityNumerator / divisor,
    }));
}

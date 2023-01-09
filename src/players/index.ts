import { useEffect } from "react";
import { InstrumentName, instrument as getInstrument } from "soundfont-player";

import * as C from "../constants";
import FatBoy_names from "../sf/FatBoy/names.json";
import FluidR3_GM_names from "../sf/FluidR3_GM/names.json";
import MusyngKite_names from "../sf/MusyngKite/names.json";
import { ActiveKeys } from "../Piano";
import NullPlayer from "./NullPlayer";
import { useStore } from "../store";

export enum SoundFont {
  FatBoy = "FatBoy",
  FluidR3_GM = "FluidR3_GM",
  MusyngKite = "MusyngKite",
  TonePiano = "TonePiano",
  Null = "Null",
}

export interface Playable {
  keyDown(args: { midi: number; velocity: number }): void;
  keyUp(args: { midi: number }): void;
  pedalDown(): void;
  pedalUp(): void;
  stopAll(): void;
}

export const availableInstruments = {
  [SoundFont.FatBoy]: FatBoy_names as InstrumentName[],
  [SoundFont.FluidR3_GM]: FluidR3_GM_names as InstrumentName[],
  [SoundFont.MusyngKite]: MusyngKite_names as InstrumentName[],
  [SoundFont.TonePiano]: ["acoustic_grand_piano"],
  [SoundFont.Null]: [],
} satisfies Record<SoundFont, ReadonlyArray<InstrumentName>>;

const ctx = new AudioContext();

export async function createPlayer(
  soundfont: SoundFont,
  instrument: InstrumentName
): Promise<Playable | null> {
  if (soundfont === "Null") {
    return new NullPlayer();
  }
  if (soundfont === "TonePiano") {
    const SimplePiano = (await import("./SimplePiano")).default;
    return new SimplePiano();
  }

  if (!availableInstruments[soundfont].includes(instrument)) {
    return null;
  }

  const [SFPlayer, sound] = await Promise.all([
    import("./SFPlayer").then(module => module.default),
    getInstrument(ctx, instrument, { soundfont }),
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

import { Char, ThirdQuality } from "./constants";

export interface ChordType {
  // Primary symbol to display after the note name
  readonly symbol: string;
  // Other symbols commonly used
  readonly aliases: readonly string[];
  // Chromatic intervals from root (for now just triad or 7th)
  readonly intervals:
    | readonly [number, number]
    | readonly [number, number, number];
}

export function getChordTypeQuality(type: ChordType): ThirdQuality | null {
  if (type.intervals[0] === 3) {
    return ThirdQuality.MINOR;
  }
  if (type.intervals[0] === 4) {
    return ThirdQuality.MAJOR;
  }

  return null;
}

export const ChordTypes = {
  maj: {
    symbol: "",
    aliases: ["maj", "M"],
    intervals: [4, 7],
  },
  min: {
    symbol: "m",
    aliases: ["-", "min"],
    intervals: [3, 7],
  },
  dim: {
    symbol: Char.DIM,
    aliases: ["dim", "o"],
    intervals: [3, 6],
  },
  aug: {
    symbol: "+",
    aliases: ["aug"],
    intervals: [4, 8],
  },
  dom7: {
    symbol: "7",
    aliases: ["dom7"],
    intervals: [4, 7, 10],
  },
  maj7: {
    symbol: "maj7",
    aliases: ["M7", Char.TRIANGLE, Char.TRIANGLE + "7"],
    intervals: [4, 7, 11],
  },
  m7: {
    symbol: "m7",
    aliases: ["-7", "min7"],
    intervals: [3, 7, 10],
  },
  mMaj7: {
    symbol: "mMaj7",
    aliases: ["mM7", `-${Char.TRIANGLE}7`, "minMaj7"],
    intervals: [3, 7, 11],
  },
  dim7: {
    symbol: Char.DIM + "7",
    aliases: ["dim7", "o7"],
    intervals: [3, 6, 9],
  },
  m7b5: {
    symbol: Char.HALFDIM + "7",
    aliases: [Char.HALFDIM, "m7b5", "min7b5", "-7b5", "m7-5", "min7-5", "-7-5"],
    intervals: [3, 6, 10],
  },
} satisfies Record<string, ChordType>;

const dimTypes: ChordType[] = [
  ChordTypes.dim,
  ChordTypes.m7b5,
  ChordTypes.dim7,
];

export function chordIsDiminished(type: ChordType) {
  return dimTypes.includes(type);
}

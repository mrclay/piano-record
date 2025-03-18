import { ActiveKeys } from "../Piano";
import Key from "./Key";
import { ThirdQuality } from "./constants";

export type ActiveScaleDegrees = Map<number, string>;

const scaleDegrees = [
  "1", //   0
  "b2", //  1
  "2", //   2
  "b3", //  3
  "3", //   4
  "4", //   5
  "b5", //  6
  "5", //   7
  "b6", //  8
  "6", //   9
  "b7", // 10
  "7", //  11
];

let lastCache = null as null | {
  prevKey: Key;
  prevScaleDegrees: string[];
  prevChromatics: Set<number>;
};

export function scaleDegreesForKeys(
  key: Key,
  activeKeys: ActiveKeys,
  cache: "hold" | false = "hold",
): ActiveScaleDegrees {
  const chromaticBase = key.items[0].getChromatic();
  const foundDegrees = new Set<string>();
  const foundChromatics = new Set<number>();

  // First pass, collect present notes
  for (const midi of activeKeys.values()) {
    const chromatic = (12 + midi - chromaticBase) % 12;
    foundChromatics.add(chromatic);
    const degree = scaleDegrees[chromatic];
    foundDegrees.add(degree);
  }

  // If the key is the same and no new notes are played, use the last
  // computed set of scale degrees.
  if (cache !== false && lastCache && lastCache.prevKey === key) {
    const hasNewNote =
      foundChromatics.union(lastCache.prevChromatics).size >
      lastCache.prevChromatics.size;
    if (!hasNewNote) {
      // Use last set of scale degrees
      const out = new Map<number, string>();
      for (const midi of activeKeys.values()) {
        const chromatic = (12 + midi - chromaticBase) % 12;
        out.set(midi, lastCache.prevScaleDegrees[chromatic]);
      }
      return out;
    }
  }

  const every = (...degrees: Array<number | string>) =>
    degrees.every(el =>
      typeof el === "number" ? foundChromatics.has(el) : foundDegrees.has(el),
    );

  let outScaleDegrees = scaleDegrees.slice();

  if (key.getQuality() === ThirdQuality.MINOR && every(11, 3, 6)) {
    // b1 chord!
    outScaleDegrees[11] = "b1";
  } else {
    // Use known chords to find sharps
    for (const chord of knownChords) {
      const allowedChromatics = new Set(chord.notes.map(el => el.chromatic));
      if (!foundChromatics.isSubsetOf(allowedChromatics)) {
        // Non-match
        continue;
      }
      const requireChromatics = new Set(
        chord.notes.filter(el => el.required).map(el => el.chromatic),
      );
      if (!foundChromatics.isSupersetOf(requireChromatics)) {
        // Non-match
        continue;
      }

      // Set sharps
      chord.notes
        .filter(el => el.sharps === 1)
        .forEach(el => {
          outScaleDegrees[el.chromatic] = `#${el.degree}`;
        });
      // console.log(`Chord: ${chord.str}`);
      break;
    }
  }

  // Cache for next call.
  lastCache = {
    prevKey: key,
    prevChromatics: foundChromatics,
    prevScaleDegrees: outScaleDegrees,
  };

  const out: ActiveScaleDegrees = new Map();

  // Second pass, write output
  for (const midi of activeKeys.values()) {
    const chromatic = (12 + midi - chromaticBase) % 12;
    out.set(midi, outScaleDegrees[chromatic]);
  }

  return out;
}

// Exact matches. Use the accidentals in these matches, then assume
// flats for everything else.
const knownChords = [
  // Cases with D#
  "D# [F#] [G] [A] B",
  "D# [F#] [G] G# A B",
  // Cases with F#
  "F# [A] C D F",
  "F# [G] [A] [B] [C] [D] [E]",
  "F# [G#] A [B] [C] [D] Eb [F]",
  "Ab [Bb] C [D] [Eb] [F] Gb",
  "F# [G#] [A] [B] C [D] Eb [F]",
  // Cases with C#/Db
  "Db F [G] [Bb]",
  "C# [E] G A C",
  "C# [D] [E] [F] [G] [A] [Bb] [B]",
  "C# [E] F# G A [Bb] [B]", // A13
  // Cases with G#/Ab
  "Ab C [D] [Eb] F#",
  "G# B D F#",
  "G# [B] [C] D E [F] [G]",
  "G# [B] D E G",
  "Ab [Bb] C [D] F [G]",
  "Ab [Bb] C [D] E F [G]",
  "Ab [Bb] C [D] Eb [F] [G]",
  "Ab B [D] [E] [F] G", // G7b9
  "G# [A] [B] [C] [D] E [F] [F#] [G]",
  "G# [B] C# D E [F] [F#]", // E13
  "G# [A] [B] D [E] F",
  "G# B [D] F",
  // A# (we'll say none)
].map(chord => ({
  str: chord,
  notes: chord.split(" ").map(str => {
    const required = str[0] !== "[";
    const note = required ? str : str.substring(1, str.length - 1);
    const letter = note[0];
    const accidental = note[1];
    const sharps = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
    const degree = "CDEFGAB".indexOf(letter) + 1;
    const chromatic = Number(
      ({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[letter] || 0) + sharps,
    );
    return { degree, chromatic, sharps, required };
  }),
}));

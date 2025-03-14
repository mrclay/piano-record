import { ActiveKeys } from "../Piano";
import Key from "./Key";
import { ThirdQuality } from "./constants";

const scaleDegrees = [
  "1", //      0
  "#1/b2", //  1
  "2", //      2
  "#2/b3", //  3
  "3", //      4
  "4", //      5
  "#4/b5", //  6
  "5", //      7
  "#5/b6", //  8
  "6", //      9
  "#6/b7", // 10
  "7", //     11
];

let lastCache = null as null | {
  prevKey: Key;
  prevScaleDegrees: string[];
  prevChromatics: Set<number>;
};

export function scaleDegreesForKeys(key: Key, activeKeys: ActiveKeys) {
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
  if (lastCache && lastCache.prevKey === key) {
    const hasNewNote =
      foundChromatics.union(lastCache.prevChromatics).size >
      foundChromatics.size;
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

  const some = (...degrees: Array<number | string>) =>
    degrees.some(el =>
      typeof el === "number" ? foundChromatics.has(el) : foundDegrees.has(el),
    );
  const every = (...degrees: Array<number | string>) =>
    degrees.every(el =>
      typeof el === "number" ? foundChromatics.has(el) : foundDegrees.has(el),
    );

  let outScaleDegrees = scaleDegrees.slice();
  let modified: boolean;
  const replaceAll = (str1: string, str2: string) => {
    foundDegrees.delete(str1);
    foundDegrees.add(str2);

    const idx = outScaleDegrees.indexOf(str1);
    if (idx !== -1) {
      outScaleDegrees[idx] = str2;
    }
  };

  function useMinorAccidentals() {
    replaceAll("#1/b2", "b2");
    replaceAll("#2/b3", "b3");
    replaceAll("#5/b6", "b6");
    replaceAll("#6/b7", "b7");
  }

  if (key.getQuality() === ThirdQuality.MINOR) {
    useMinorAccidentals();
  }

  modified = true;
  while (modified) {
    modified = false;

    if (every("#1/b2", "#4/b5", "#6/b7")) {
      useMinorAccidentals();
      replaceAll("#4/b5", "b5");

      if (every(3, 6, 11)) {
        replaceAll("7", "b1");
      }
    }

    if (some("#1/b2")) {
      if (some(4, 6, 7, 9)) {
        replaceAll("#1/b2", "#1");
        replaceAll("#6/b7", "b7");
      } else if (some(5, 6, 8, 10)) {
        useMinorAccidentals();
        replaceAll("#4/b5", "b5");
      }
    }

    if (some("#2/b3")) {
      if (some(11, 6, 9)) {
        replaceAll("#2/b3", "#2");
        replaceAll("#4/b5", "#4");
      } else {
        useMinorAccidentals();
      }
    }

    if (some("#4/b5")) {
      if (some(2, 9, 0)) {
        replaceAll("#4/b5", "#4");
        replaceAll("#5/b6", "#5");
      } else {
        replaceAll("#4/b5", "b5");
        replaceAll("#6/b7", "b7");
      }
    }

    if (some("#5/b6")) {
      if (some(4, 11)) {
        replaceAll("#5/b6", "#5");
        replaceAll("#4/b5", "#4");
      } else {
        useMinorAccidentals();
      }
    }

    if (some("#6/b7")) {
      if (every(10, 1)) {
        replaceAll("#6/b7", "#6");
      } else {
        useMinorAccidentals();
      }
    }
  }

  // Cache for next call.
  lastCache = {
    prevKey: key,
    prevChromatics: foundChromatics,
    prevScaleDegrees: outScaleDegrees,
  };

  const out = new Map<number, string>();

  // Second pass, write output
  for (const midi of activeKeys.values()) {
    const chromatic = (12 + midi - chromaticBase) % 12;
    out.set(midi, outScaleDegrees[chromatic]);
  }

  return out;
}

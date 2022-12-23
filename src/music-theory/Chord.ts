import Note from "./Note";
import {
  Char,
  majorKeys,
  minorKeys,
  readNotePattern,
  ThirdQuality,
} from "./constants";
import Key from "./Key";
import { boundModulo } from "./CircularSet";

interface ChordType {
  symbol: string;
  offsets: [number, number] | [number, number, number];
  aliases: string[];
}

export interface Chord {
  root: Note;
  type: ChordType;
  typeStr: string;
}

export function parseChord(name: string): Chord | null {
  const m = name.match(readNotePattern);
  if (!m) {
    return null;
  }

  const root = Note.fromName(m[0]);
  const rest = name.substring(m[0].length);

  const tuple = typeMatches.find(t => rest === t[0]);
  if (!tuple) {
    return null;
  }

  return {
    root,
    type: tuple[1],
    typeStr: rest,
  };
}

export const chordTypes: Record<string, ChordType> = {
  maj: {
    symbol: "",
    aliases: ["maj", "M"],
    offsets: [4, 7],
  },
  min: {
    symbol: "m",
    aliases: ["-", "min"],
    offsets: [3, 7],
  },
  dim: {
    symbol: Char.DIM,
    aliases: ["dim", "o"],
    offsets: [3, 6],
  },
  aug: {
    symbol: "+",
    aliases: ["aug"],
    offsets: [4, 8],
  },
  dom7: {
    symbol: "7",
    aliases: ["dom7"],
    offsets: [4, 7, 10],
  },
  maj7: {
    symbol: "maj7",
    aliases: ["M7", Char.TRIANGLE, Char.TRIANGLE + "7"],
    offsets: [4, 7, 11],
  },
  m7: {
    symbol: "m7",
    aliases: ["-7", "min7"],
    offsets: [3, 7, 10],
  },
  mMaj7: {
    symbol: "mMaj7",
    aliases: ["mM7", `-${Char.TRIANGLE}7`, "minMaj7"],
    offsets: [3, 7, 11],
  },
  dim7: {
    symbol: Char.DIM + "7",
    aliases: ["dim7", "o7"],
    offsets: [3, 6, 9],
  },
  m7b5: {
    symbol: Char.HALFDIM + "7",
    aliases: [Char.HALFDIM, "m7b5", "min7b5", "-7b5", "m7-5", "min7-5", "-7-5"],
    offsets: [3, 6, 10],
  },
};

const dimTypes = [chordTypes.dim, chordTypes.dim7, chordTypes.m7b5];

const majorScores = {
  // Bump for tonic
  "I maj7": 15,
  "IV maj7": 10,
  "V 7": 10,
  "V +": 6,
  "vi m7": 9,
  "ii m7": 9,
  "iii m7": 9,
  "V/vi +": 5,
  "ii m7b5": 5,
  "bIII maj7": 5,
  "iv m7": 5,
  "v m7": 5,
  "bVI maj7": 5,
  "bVII 7": 5,
  "V/IV 7": 5,
  "V/V 7": 5,
  "V/vi 7": 5,
  "V/ii 7": 4,
  "IV 7": 5,
  "bVI 7": 2,
  "#iv m7b5": 3,
  "vii m7b5": 3,
  "I +": 2,
  "bII maj7": 2,
  "bVII maj7": 2,
  "iv maj7": 5,
  "bII 7": 2,
  "bV 7": 2,
  "ii/ii m7b5": 1,
  "ii/IV m7b5": 1,
  "vii m7": 1,

  // Try to guess function in output but don't affect score
  "vii/ii dim7": 0,
  "vii/V dim7": 0,
  "vii/vi dim7": 0,
  "vii dim7": 0,

  // Very unusual ones
  "V maj7": -10,
  "II maj7": -10,
};
const minorScores = {
  // Bump for tonic
  "i m7": 15,
  "V 7": 10,
  "V +": 6,
  "iv m7": 10,
  "bIII maj7": 9,
  "v m7": 9,
  "bVI maj7": 9,
  "bVII 7": 9,
  "ii m7b5": 9,

  "ii m7": 5,
  "IV 7": 5,
  "bII maj7": 5,
  "ii/V m7b5": 5,
  "ii/bVI m7": 3,

  "V/iv 7": 4,
  "V/V 7": 4,
  "V/bVI 7": 4,
  "I maj7": 2,

  "I mMaj7": 2,
  "bVI 7": 2,
  "subV 7": 2,
  "bI ": 1,

  // Try to guess function in output but don't affect score
  "vii/V dim7": 0,
  "vii/iv dim7": 0,
  "vii dim7": 0,

  // Very unusual ones
  "VI ": -10,
};

export const typeMatches: Array<[string, ChordType]> = [];
Object.values(chordTypes).map(type => {
  typeMatches.push([type.symbol, type]);
  type.aliases.forEach(alias => typeMatches.push([alias, type]));
});

typeMatches.sort((a, b) => {
  if (a[0].length > b[0].length) {
    return -1;
  }
  if (a[0].length < b[0].length) {
    return 1;
  }
  return 0;
});

// Get normalized strings of chromatic degrees in triad and seventh
// E.g. Cm7   => "0,3,7" and "0,3,7,10"
//      Fmaj7 => "0,5,9" and "0,4,5,9"
function getChromaticDegrees(chord: Chord) {
  const chromaticRoot = chord.root.getChromatic();

  const chordNotes = [0, ...chord.type.offsets].map(offset =>
    boundModulo(12, chromaticRoot + offset)
  );
  const triad = chordNotes.slice(0, 3).sort().join(",");
  let seventh = "";
  if (chordNotes.length >= 4) {
    seventh = chordNotes.slice(0, 4).sort().join(",");
  }

  return { triad, seventh };
}

interface ScoredChord {
  given: Chord;
  score: number;
  chordInKey?: Chord;
  func?: string;
}

interface ScoreChordArgs {
  key: Key;
  given: Chord;
  prev?: Chord;
  next?: Chord;
}

export function scoreChord({
  key,
  given,
  prev,
  next,
}: ScoreChordArgs): ScoredChord {
  const givenCDegrees = getChromaticDegrees(given);

  const scoreList =
    key.getQuality() === ThirdQuality.MAJOR ? majorScores : minorScores;
  const majKey =
    key.getQuality() === ThirdQuality.MAJOR
      ? key
      : Key.major(key.getTonicNote());

  const possibleScores: ScoredChord[] = Object.entries(scoreList)
    .map(([name, score]) => {
      let [func, type] = name.split(" ");
      const root = majKey.getNoteFromRoman(func).toString();
      const chordInKey = parseChord(`${root}${type}`);
      if (!chordInKey) {
        throw new Error(`Cannot parse chord type: ${type}`);
      }

      const compareCDegrees = getChromaticDegrees(chordInKey);

      if (
        chordInKey.type === chordTypes.dim7 &&
        given.type === chordTypes.dim7
      ) {
        // Special case: Since these are symmetrical, assume that user may
        // have given an incorrect root, so let's just bypass the triad check.
      } else {
        if (givenCDegrees.triad !== compareCDegrees.triad) {
          // Not same triad
          return null;
        }
      }

      if (
        givenCDegrees.seventh &&
        compareCDegrees.seventh &&
        givenCDegrees.seventh !== compareCDegrees.seventh
      ) {
        // Has a 7th that doesn't match.
        return null;
      }

      let boost = 0;
      if (givenCDegrees.seventh) {
        // Full seventh matched
        boost += 1;
      }
      if (!prev) {
        // First chord...
        if (score === 15) {
          // ...is the tonic
          boost += 2;
        } else if (score < 4 && score !== 0) {
          // ...is unusual
          boost -= 2;
        }
      }

      const chordScore = score + boost;

      if (dimTypes.includes(given.type) && !func.includes(Char.DIM)) {
        if (func === "#iv") {
          // Special case. This was probably a dim triad
          func = "vii/V";
        }
        const parts = func.split("/");
        parts[0] += Char.DIM;
        func = parts.join("/");
      }

      const ret: ScoredChord = { chordInKey, given, score: chordScore, func };
      return ret;
    })
    .filter((el): el is ScoredChord => el !== null);

  // return top score
  possibleScores.sort((a, b) => {
    if (a.score === b.score) {
      return 0;
    }
    return a.score < b.score ? 1 : -1;
  });

  return possibleScores[0] || { score: -5, given };
}

// Set a Key here to limit scoring
const DEBUG_KEY: Key | null = null;

const allKeys: Key[] = DEBUG_KEY
  ? [DEBUG_KEY]
  : [
      ...majorKeys.map(name => Key.major(name)),
      ...minorKeys.map(name => Key.minor(name)),
    ];

export const scoreProgression = (chords: Chord[]) => {
  return allKeys
    .map(key => {
      const scores = chords.map((el, idx) =>
        scoreChord({
          key,
          given: el,
          prev: chords[idx - 1],
          next: chords[idx + 1],
        })
      );
      const breakdown = scores.map(el => el.score).join(" + ");
      const total = scores.reduce((acc, curr) => acc + curr.score, 0);

      return {
        key,
        total,
        breakdown,
        scores,
      };
    })
    .sort((a, b) => {
      if (a.total === b.total) {
        return 0;
      }
      return a.total > b.total ? -1 : 1;
    });
};

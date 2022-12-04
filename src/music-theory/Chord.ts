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

const majorScores = {
  // Bump for tonic
  "I maj7": 15,
  "IV maj7": 10,
  "V 7": 10,
  "V +": 6,
  "vi m7": 9,
  "ii m7": 9,
  "iii m7": 9,
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
  "iii m7b5": 1,
  "v m7b5": 1,
  "vii m7": 1,

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
  "vii dim7": 9,
  "bIII maj7": 9,
  "v m7": 9,
  "bVI maj7": 9,
  "bVII 7": 9,
  "ii m7b5": 9,

  "ii m7": 5,
  "IV 7": 5,
  "bII maj7": 5,
  "ii/bVI m7": 3,

  "V/iv 7": 4,
  "V/V 7": 4,
  "V/bVI 7": 4,
  "I maj7": 2,

  "I mMaj7": 2,
  "bVI 7": 2,
  "subV 7": 2,
  "bI ": 1,
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

// Get normalized strings of chromatic notes in triad and seventh
// E.g. Cm7   => "0,3,7" and "0,3,7,10"
//      Fmaj7 => "0,5,9" and "0,4,5,9"
function chordAsStrings(chord: Chord) {
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

export function scoreChord(key: Key, given: Chord): ScoredChord {
  const testStrings = chordAsStrings(given);

  const scoreList =
    key.getQuality() === ThirdQuality.MAJOR ? majorScores : minorScores;
  const majKey =
    key.getQuality() === ThirdQuality.MAJOR
      ? key
      : Key.major(key.getTonicNote());

  let best: ScoredChord = { score: 0, given };

  for (const [name, score] of Object.entries(scoreList)) {
    const [func, type] = name.split(" ");
    const root = majKey.getNoteFromRoman(func).toString();
    const chordInKey = parseChord(`${root}${type}`);
    if (!chordInKey) {
      throw new Error(`Cannot parse chord type: ${type}`);
    }

    const strings = chordAsStrings(chordInKey);

    if (testStrings.triad !== strings.triad) {
      continue;
    }

    if (!testStrings.seventh) {
      if (score > best.score) {
        best = { given, chordInKey, func, score };
      }
      continue;
    }

    if (testStrings.seventh !== strings.seventh) {
      // Non-matching 7th
      continue;
    }

    // Seventh matched, bump score a tiny bit
    if (score + 1 > best.score) {
      best = { given, chordInKey, func, score: score + 1 };
    }
  }

  return best;
}

export const scoreProgression = (chords: Chord[]) => {
  const keys: Key[] = [
    ...majorKeys.map(name => Key.major(name)),
    ...minorKeys.map(name => Key.minor(name)),
  ];

  return keys
    .map(key => {
      const scores = chords.map(el => scoreChord(key, el));
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

import Note from "./Note";
import { Char, readNotePattern } from "./constants";
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

const majorScores = {
  "I maj7": 10,
  "IV maj7": 10,
  "V 7": 10,
  "vi m7": 10,
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
  "IV 7": 4,
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

export function scoreChord(
  key: Key,
  test: Chord
): { func: string; score: number } {
  const testStrings = chordAsStrings(test);

  for (const [name, score] of Object.entries(majorScores)) {
    const [func, type] = name.split(" ");
    const root = key.getNoteFromRoman(func).toString();
    const chord = parseChord(`${root}${type}`);
    if (!chord) {
      throw new Error(`Cannot parse chord type: ${type}`);
    }

    const strings = chordAsStrings(chord);

    if (testStrings.triad !== strings.triad) {
      continue;
    }

    if (!testStrings.seventh) {
      return { func, score };
    }

    if (testStrings.seventh !== strings.seventh) {
      // Non-matching 7th
      continue;
    }

    // Seventh matched, bump score a tiny bit
    return { func, score: score + 1 };
  }

  return { func: "", score: 0 };
}

export const readNotePattern = /^([A-Ga-g])(♭|bb|b|𝄫|♯|##|#|𝄪|x|♮|)/;

export enum Char {
  FLAT = "♭",
  DOUBLEFLAT = "𝄫",
  NATURAL = "♮",
  SHARP = "♯",
  DOUBLESHARP = "𝄪",
  DIM = "\u00B0",
  HALFDIM = "\u00F8",
  TRIANGLE = "\u0394",
}

export const readAccidentalsMap: Record<string, number> = {
  bb: -2,
  [Char.DOUBLEFLAT]: -2,
  b: -1,
  [Char.FLAT]: -1,
  "": 0,
  [Char.NATURAL]: 0,
  [Char.SHARP]: 1,
  "#": 1,
  [Char.DOUBLESHARP]: 2,
  "##": 2,
  x: 2,
};

export const writeAccidentalsMap: Record<string, string> = {
  "-2": "bb",
  "-1": "b",
  "0": "",
  "1": "#",
  "2": "x",
};
export const unicodeAccidentalsMap: Record<string, string> = {
  "-2": Char.DOUBLEFLAT,
  "-1": Char.FLAT,
  "0": "",
  "1": Char.SHARP,
  "2": Char.DOUBLESHARP,
};

export const diatonicOffsets = [2, 2, 1, 2, 2, 2, 1];
export const cMajorLetters = "CDEFGAB".split("");
export const majorKeys = "C C# Db D Eb E F F# Gb G G# Ab A Bb B".split(" ");
export const minorKeys = "C C# D Eb E F F# G G# A Bb B".split(" ");
export const midiClasses = "C C# D D# E F F# G G# A A# B".split(" ");

export enum ThirdQuality {
  MAJOR = "major",
  MINOR = "minor",
}

// const diatonicTriads = ['', 'm', 'm', '', '', 'm', 'dim'];
// const diatonicSevenths = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'ø7'];

export const commonChords = {
  inMajor: {
    // See http://mrclay.org/common-chords/C-major
    // Bump for tonic
    "I maj7": 15,

    "IV maj7": 10,
    "V 7": 10,
    "vi m7": 9,
    "ii m7": 9,
    "iii m7": 9,
    "V +": 6,
    "V/vi +": 5,
    "ii m7b5": 5,
    "bIII maj7": 5,
    "iv m7": 5,
    "iv mMaj7": 5,
    "v m7": 5,
    "bVI maj7": 5,
    "bVII 7": 5,
    "bVII maj7": 5,
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
    "iv maj7": 5,
    "bII 7": 2,
    "bV 7": 2,
    "ii/ii m7b5": 1,
    "ii/IV m7b5": 1,
    "vii m7": 1,
    "vii/ii dim7": 1,
    "vii/V dim7": 1,
    "vii/vi dim7": 1,
    "vii dim7": 1,
  },
  inMinor: {
    // See http://mrclay.org/common-chords/C-minor
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
    "vii/V dim7": 1,
    "vii dim7": 1,

    // Don't think I've ever heard it.
    "vii/iv dim7": 0,
  },
} as const;
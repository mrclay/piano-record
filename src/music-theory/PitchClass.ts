import { diatonicOffsets, cMajorLetters } from "./constants";
import CircularSet from "./CircularSet";

export interface PitchClass {
  // "C"
  readonly letter: string;

  // C = 0 ... B = 6
  readonly idx: number;

  // How many semitones are added going to the next pitch class
  // (1 for B and E, 2 for rest)
  readonly width: number;

  // Chromatic offset within C major
  // C = 0, D = 2, ... B = 11
  readonly chromatic: number;
}

function makePitchClasses(): readonly PitchClass[] {
  let chromatic = 0;
  const pitchClasses: PitchClass[] = [];

  diatonicOffsets.forEach((width, idx) => {
    pitchClasses.push({
      letter: cMajorLetters[idx],
      idx,
      width,
      chromatic,
    });
    chromatic += width;
  });

  return pitchClasses;
}

const pitchClasses = makePitchClasses();

const pitchClassSet = new CircularSet<PitchClass>(pitchClasses);

const pitchClassMap = pitchClasses.reduce<Record<string, PitchClass>>(
  (prev, curr) => ({
    ...prev,
    [curr.letter]: curr,
  }),
  {}
);

export function getPitchClass(letter: string) {
  const found = pitchClassMap[letter.toUpperCase()];
  if (!found) {
    throw new Error(`Invalid letter "${letter}"`);
  }

  return found;
}

export function incPitchClass(pitchClass: PitchClass, offset = 1) {
  return pitchClassSet.get(pitchClass.idx + offset);
}

export { pitchClasses };

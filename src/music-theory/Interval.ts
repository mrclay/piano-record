import Note, { FlexNote } from "./Note";
import { boundModulo } from "./CircularSet";

interface Interval {
  deltaPitchClasses: number;
  deltaSemitones: number;
  isEnharmonic: boolean;
  name: string;
}

const nameIntervalmap: Record<string, string> = {
  // "deltaPitchClasses deltaSemitones"
  "0 0": "P1",
  "1 0": "d2",
  "6 0": "A7",
  "0 1": "A1",
  "1 1": "m2",
  "1 2": "M2",
  "2 2": "d3",
  "1 3": "A2",
  "2 3": "m3",
  "2 4": "M3",
  "3 4": "d4",
  "2 5": "A3",
  "3 5": "P4",
  "3 6": "A4",
  "4 6": "d5",
  "4 7": "P5",
  "5 7": "d6",
  "4 8": "A5",
  "5 8": "m6",
  "5 9": "M6",
  "6 9": "d7",
  "5 10": "A6",
  "6 10": "m7",
  "6 11": "M7",
  "0 11": "d8",
};

function nameInterval(letters: number, semitones: number): string {
  return nameIntervalmap[`${letters} ${semitones}`] || "";
}

export function getInterval(one: FlexNote, two: FlexNote): Interval {
  const rawOne = Note.fromName(one);
  const rawTwo = Note.fromName(two);
  const a = rawOne.sharps + rawOne.pitchClass.chromatic;
  const b = rawTwo.sharps + rawTwo.pitchClass.chromatic;

  const deltaPitchClasses = boundModulo(
    7,
    rawTwo.pitchClass.idx - rawOne.pitchClass.idx,
  );
  const deltaSemitones = boundModulo(12, b - a);
  const name = nameInterval(deltaPitchClasses, deltaSemitones);
  const isEnharmonic = deltaSemitones === 0;

  return {
    deltaPitchClasses,
    deltaSemitones,
    name,
    isEnharmonic,
  };
}

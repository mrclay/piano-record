import { PitchClass, getPitchClass, incPitchClass } from "./PitchClass";
import {
  readNotePattern,
  readAccidentalsMap,
  writeAccidentalsMap,
  unicodeAccidentalsMap,
} from "./constants";
import { boundModulo } from "./CircularSet";

export type FlexNote = Note | string;

export default class Note {
  static unicodeAccidentals = false;

  readonly pitchClass: PitchClass;

  // # = 1, x = 2, b = -1, bb = -2
  readonly sharps: number;

  constructor(pitch: PitchClass, sharps: number) {
    this.pitchClass = pitch;
    this.sharps = sharps;
  }

  getChromatic() {
    return boundModulo(12, this.pitchClass.chromatic + this.sharps);
  }

  static fromName(name: FlexNote): Note {
    if (name instanceof Note) {
      return name;
    }

    const m = name.match(readNotePattern);
    if (!m) {
      throw new Error(`Could not parse note "${name}"`);
    }
    const [, letter, accidental] = m;

    return new Note(getPitchClass(letter), readAccidentalsMap[accidental]);
  }

  getNextNote(semitones: number) {
    return new Note(
      incPitchClass(this.pitchClass),
      this.sharps + semitones - this.pitchClass.width
    );
  }

  toString(unicodeAccidentals = Note.unicodeAccidentals) {
    const map = unicodeAccidentals
      ? unicodeAccidentalsMap
      : writeAccidentalsMap;
    return `${this.pitchClass.letter}${map[this.sharps]}`;
  }
}

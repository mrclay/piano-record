import type { PitchClass } from "./PitchClass";
import { getPitchClass, incPitchClass } from "./PitchClass";
import {
  readNotePattern,
  readAccidentalsMap,
  writeAccidentalsMap,
  unicodeAccidentalsMap,
} from "./constants";
import { boundModulo } from "./CircularSet";

export type FlexNote = Note | string;

const noteCache = new Map<string, Note>();

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

    const cached = noteCache.get(name);
    if (cached) {
      return cached;
    }

    const m = name.match(readNotePattern);
    if (!m) {
      throw new Error(`Could not parse note "${name}"`);
    }
    const [, letter, accidental] = m;

    const note = new Note(
      getPitchClass(letter),
      readAccidentalsMap[accidental]
    );

    noteCache.set(name, note);
    return note;
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

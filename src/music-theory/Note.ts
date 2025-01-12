import { PitchClass, getPitchClass, incPitchClass } from "./PitchClass";
import {
  readNotePattern,
  readAccidentalsMap,
  writeAccidentalsMap,
  unicodeAccidentalsMap,
  midiClasses,
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
    const [, letter = "", accidental = ""] = m;

    const note = new Note(
      getPitchClass(letter),
      readAccidentalsMap[accidental] || 0,
    );

    noteCache.set(name, note);
    return note;
  }

  getNextNote(semitones: number) {
    return new Note(
      incPitchClass(this.pitchClass),
      this.sharps + semitones - this.pitchClass.width,
    );
  }

  toString(unicodeAccidentals = Note.unicodeAccidentals) {
    const map = unicodeAccidentals
      ? unicodeAccidentalsMap
      : writeAccidentalsMap;
    return `${this.pitchClass.letter}${map[this.sharps]}`;
  }
}

export function noteOctaveFromMidi(midi: number) {
  const octave = Math.floor(midi / 12) - 1;
  const note = midiClasses[midi % 12]!;
  return note + octave;
}

export function midiFromNoteOctave(noteOctave: string) {
  // prettier-ignore
  const name_to_pc: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  const letter = String(noteOctave[0]);
  let pc = name_to_pc[letter.toUpperCase()]!;

  const mod = String(noteOctave[1]);
  const trans = readAccidentalsMap[mod] || 0;

  pc += trans;

  const octave = parseInt(noteOctave.at(-1) || "0");
  if (octave) {
    return pc + 12 * (octave + 1);
  } else {
    // negative mod 12
    return ((pc % 12) + 12) % 12;
  }
}

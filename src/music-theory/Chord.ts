import Note from "./Note";
import { readNotePattern } from "./constants";
import { boundModulo } from "./CircularSet";
import type { ChordType } from "./ChordType";
import { ChordTypes } from "./ChordType";

export interface Chord {
  root: Note;
  type: ChordType;
}

export interface ParsedChord extends Chord {
  // Note name given by user.
  givenNote: string;
  // Type given by user. E.g. "-7" or "m7"
  givenSymbol: string;
}

const typesBySymbol: Map<string, ChordType> = (() => {
  const map = new Map<string, ChordType>();

  Object.values(ChordTypes).map(type => {
    map.set(type.symbol, type);
    type.aliases.forEach(alias => map.set(alias, type));
  });

  return map;
})();

export function parseChord(name: string): ParsedChord | null {
  const m = name.match(readNotePattern);
  if (!m) {
    return null;
  }

  const givenNote = m[0];
  const root = Note.fromName(givenNote);
  const givenSymbol = name.substring(givenNote.length);

  const type = typesBySymbol.get(givenSymbol);
  if (!type) {
    return null;
  }

  return {
    root,
    type,
    givenNote,
    givenSymbol,
  };
}

// Get unique strings representing the pitches in the triad and seventh
// version of the chords. Note names and octave are ignored.
// E.g. Cm7   => "0,3,7" and "0,3,7,10"
//      Fmaj7 => "0,5,9" and "0,4,5,9"
export function getChordPitches(chord: Chord) {
  const chromaticRoot = chord.root.getChromatic();

  const chordNotes = [0, ...chord.type.intervals].map(offset =>
    boundModulo(12, chromaticRoot + offset)
  );
  const triad = chordNotes.slice(0, 3).sort().join(",");
  let seventh = "";
  if (chordNotes.length >= 4) {
    seventh = chordNotes.slice(0, 4).sort().join(",");
  }

  return { triad, seventh };
}

import { expect, test } from "vitest";
import Note from "./Note";

test.each([
  ["A#", 2, "B#"],
  ["B♯", 1, "C#"],
  ["A", 3, "B#"],
  ["C#", 1, "D"],
  ["E", 3, "Fx"],
  ["Gb", 1, "Abb"],
  ["A♭", 2, "Bb"],
  ["F𝄪", 2, "Gx"],
])("Note after %s, adding %s semitones: %s", (name, offset, expected) => {
  const note = Note.fromName(name);
  expect(note.getNextNote(offset) + "").toBe(expected);
});

test.each([
  ["C", "C"],
  ["D#", "D#"],
  ["Eb", "Eb"],
  ["Fbb", "Fbb"],
  ["G##", "Gx"],
])("Note %s is read and output as %s", (input, expected) => {
  expect(Note.fromName(input) + "").toBe(expected);
});

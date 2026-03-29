import { expect, test, it } from "vitest";
import { getInterval } from "./Interval";

test.each([
  ["A", "C", 2, 3, "m3"],
  ["C", "A", 5, 9, "M6"],
  ["C#", "E#", 2, 4, "M3"],
  ["Ab", "B", 1, 3, "A2"],
  ["B", "Ab", 6, 9, "d7"],
  ["C", "F#", 3, 6, "A4"],
  ["F#", "C", 4, 6, "d5"],
  ["Ab", "F#", 5, 10, "A6"],
])(
  "Interval %s-%s is %s letters, %s semitones: %s",
  (one, two, letters, semitones, iName) => {
    const interval = getInterval(one, two);
    expect(interval.deltaPitchClasses).toBe(letters);
    expect(interval.deltaSemitones).toBe(semitones);
    expect(interval.name).toBe(iName);
  },
);

it("Can check enharmonic", () => {
  expect(getInterval("Ab", "G#").isEnharmonic).toBe(true);
  expect(getInterval("Ax", "B").isEnharmonic).toBe(true);
  expect(getInterval("Ax", "Bb").isEnharmonic).toBe(false);
});

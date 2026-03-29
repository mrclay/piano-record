import { expect, test, it } from "vitest";
import Key from "./Key";

test.each([
  ["A#", "A# B# Cx D# E# Fx Gx"],
  ["Bb", "Bb C D Eb F G A"],
  ["D", "D E F# G A B C#"],
])("Key %s major has notes: %s", (name, expectedNames) => {
  const key = Key.major(name);
  expect(key.getNoteNames().join(" ")).toBe(expectedNames);
});

test.each([
  ["A#", "A# B# C# D# E# F# G#"],
  ["Bb", "Bb C Db Eb F Gb Ab"],
  ["D", "D E F G A Bb C"],
])("Key %s minor has notes: %s", (name, expectedNames) => {
  const key = Key.minor(name);
  expect(key.getNoteNames().join(" ")).toBe(expectedNames);
});

it("Can alter scales", () => {
  const cMajor = Key.major("C");
  const cMelodicMinor = cMajor.withAltered("III", -1);

  expect(cMajor.getNoteNames().join("")).toBe("CDEFGAB");
  expect(cMajor + "").toBe("C major");
  expect(cMelodicMinor.getNoteNames().join("")).toBe("CDEbFGAB");
  expect(cMelodicMinor + "").toBe("C minor");

  const dHarmonicMinor = Key.minor("D").withAltered("vii", 1);
  expect(dHarmonicMinor.getNoteNames().join("")).toBe("DEFGABbC#");
});

const aFlat = Key.major("Ab");
test.each([
  ["#i", "A"],
  ["bII", "Bbb"],
  ["biii", "Cb"],
  ["iii", "C"],
  ["#iv", "D"],
  ["vi", "F"],
  ["bVII", "Gb"],
  ["It+6", "Fb"],
  ["V7/V", "Bb"],
  ["V/ii", "F"],
  ["vii°/vi", "E"],
  ["IV/IV", "Gb"],
  ["+6/IV", "Bbb"],
  ["V/V/V", "F"],
  ["ii/iii", "D"],
])("In Ab, %s is %s", (expression, name) => {
  expect(aFlat.getNoteFromRoman(expression) + "").toBe(name);
});

test.each([
  ["Ab", "I", "Ab major"],
  ["Ab", "ii", "Ab minor"],
  ["Ab", "iii", "Ab minor"],
  ["Ab", "IV", "Ab major"],
  ["Ab", "V", "Ab major"],
  ["Ab", "vi", "Ab minor"],
  ["Ab", "vii", "Ab minor"],
])("Call %s mode %s: %s", (tonic, degree, name) => {
  expect(Key.create(tonic, degree) + "").toBe(name);
});

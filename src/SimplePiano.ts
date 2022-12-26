import * as Tone from "tone";
import * as C from "./constants";

const urls = Object.entries({
  A: [2, 3, 4, 5, 6],
  C: [2, 3, 4, 5, 6, 7],
  "D#": [2, 3, 4, 5, 6],
  "F#": [2, 3, 4, 5, 6],
}).reduce<Record<string, string>>((prev, [note, nums]) => {
  nums.forEach(num => {
    prev[`${note}${num}`] = `${note.replace("#", "s")}${num}v8.mp3`;
  });
  return prev;
}, {});

let loaded = false;

const sampler = new Tone.Sampler({
  urls,
  release: 1,
  baseUrl: C.SAMPLES_URL,
  onload() {
    loaded = true;
  },
}).toDestination();

export default class SimplePiano {
  isPedalled = false;
  heldKeys: Set<number> = new Set();
  triggeredNotes: Set<number> = new Set();

  keyDown({ midi, velocity = 1 }: { midi: number; velocity: number }) {
    if (!loaded) {
      return;
    }
    sampler.triggerAttack(
      Tone.Frequency(midi, "midi").toFrequency(),
      undefined,
      velocity
    );
    this.triggeredNotes.add(midi);
    this.heldKeys.add(midi);
  }

  keyUp({ midi }: { midi: number }) {
    if (!loaded) {
      return;
    }
    sampler.triggerRelease(Tone.Frequency(midi, "midi").toFrequency());
    this.heldKeys.delete(midi);
    if (!this.isPedalled) {
      this.triggeredNotes.delete(midi);
    }
  }

  pedalDown() {
    this.isPedalled = true;
  }

  pedalUp() {
    this.isPedalled = false;
    if (!loaded) {
      return;
    }
    [...this.triggeredNotes.values()]
      .filter(midi => !this.heldKeys.has(midi))
      .forEach(midi => {
        sampler.triggerRelease(Tone.Frequency(midi, "midi").toFrequency());
        this.triggeredNotes.delete(midi);
      });
  }

  stopAll() {
    if (!loaded) {
      return;
    }
    sampler.releaseAll();
    this.isPedalled = false;
    this.triggeredNotes = new Set();
    this.heldKeys = new Set();
  }
}

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
  heldKeys: Record<string, true | undefined> = Object.create(null);
  triggeredNotes: Record<string, true | undefined> = Object.create(null);

  keyDown({ midi }: { midi: number }) {
    if (!loaded) {
      return;
    }
    sampler.triggerAttack(Tone.Frequency(midi, "midi").toFrequency());
    this.triggeredNotes[midi] = true;
    this.heldKeys[midi] = true;
  }

  keyUp({ midi }: { midi: number }) {
    if (!loaded) {
      return;
    }
    sampler.triggerRelease(Tone.Frequency(midi, "midi").toFrequency());
    delete this.heldKeys[midi];
    if (!this.isPedalled) {
      delete this.triggeredNotes[midi];
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
    Object.keys(this.triggeredNotes)
      .filter(midi => !this.heldKeys[midi])
      .forEach(midi => {
        sampler.triggerRelease(Tone.Frequency(midi, "midi").toFrequency());
        delete this.triggeredNotes[midi];
      });
  }

  stopAll() {
    if (!loaded) {
      return;
    }
    sampler.releaseAll();
    this.isPedalled = false;
    this.triggeredNotes = Object.create(null);
    this.heldKeys = Object.create(null);
  }
}

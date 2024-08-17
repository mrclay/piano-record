import * as Tone from "tone";
import * as C from "../constants";
import { Playable } from "./index";

export default class SimplePiano implements Playable {
  sampler;
  freqMap: Map<number, number>;
  isPedalled = false;
  heldKeys: Set<number> = new Set();
  triggeredNotes: Set<number> = new Set();

  constructor(loadedSampler: Tone.Sampler, microtone = 0) {
    this.sampler = loadedSampler;

    this.freqMap = new Map();
    for (let i = C.PLAYABLE_RANGE[0]; i < C.PLAYABLE_RANGE[1]; i++) {
      const freq = Tone.Frequency(i, "midi").transpose(microtone).toFrequency();
      this.freqMap.set(i, freq);
    }
  }

  keyDown({ midi, velocity = 1 }: { midi: number; velocity: number }) {
    this.sampler.triggerAttack(this.freqMap.get(midi)!, undefined, velocity);
    this.triggeredNotes.add(midi);
    this.heldKeys.add(midi);
  }

  keyUp({ midi }: { midi: number }) {
    this.sampler.triggerRelease(this.freqMap.get(midi)!);
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
    [...this.triggeredNotes.values()]
      .filter(midi => !this.heldKeys.has(midi))
      .forEach(midi => {
        this.sampler.triggerRelease(this.freqMap.get(midi)!);
        this.triggeredNotes.delete(midi);
      });
  }

  stopAll() {
    this.sampler.releaseAll();
    this.isPedalled = false;
    this.triggeredNotes = new Set();
    this.heldKeys = new Set();
  }

  static async fromJsonUrl(url: string, volume = -6, microtone = 0) {
    const urls = await fetch(url).then(res => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json() as unknown as Record<string, string>;
    });

    const loadedSampler = await new Promise<Tone.Sampler>(res => {
      const sampler = new Tone.Sampler({
        urls,
        release: 1,
        baseUrl: C.SAMPLES_URL,
        onload: () => res(sampler),
        volume,
      }).toDestination();
    });

    return new SimplePiano(loadedSampler, microtone);
  }
}

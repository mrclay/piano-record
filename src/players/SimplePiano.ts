import * as Tone from "tone";
import * as C from "../constants";
import { Playable } from "./index";

export default class SimplePiano implements Playable {
  sampler;
  isPedalled = false;
  heldKeys: Set<number> = new Set();
  triggeredNotes: Set<number> = new Set();

  constructor(loadedSampler: Tone.Sampler) {
    this.sampler = loadedSampler;
  }

  keyDown({ midi, velocity = 1 }: { midi: number; velocity: number }) {
    this.sampler.triggerAttack(
      Tone.Frequency(midi, "midi").toFrequency(),
      undefined,
      velocity
    );
    this.triggeredNotes.add(midi);
    this.heldKeys.add(midi);
  }

  keyUp({ midi }: { midi: number }) {
    this.sampler.triggerRelease(Tone.Frequency(midi, "midi").toFrequency());
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
        this.sampler.triggerRelease(Tone.Frequency(midi, "midi").toFrequency());
        this.triggeredNotes.delete(midi);
      });
  }

  stopAll() {
    this.sampler.releaseAll();
    this.isPedalled = false;
    this.triggeredNotes = new Set();
    this.heldKeys = new Set();
  }

  static async fromJsonUrl(url: string, volume = -6) {
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

    return new SimplePiano(loadedSampler);
  }
}

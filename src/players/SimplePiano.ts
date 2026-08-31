import * as Tone from "tone";
import * as C from "../constants";
import { type Playable } from "./index";

export default class SimplePiano implements Playable {
  midiOffset: number;
  sampler;
  isPedalled = false;
  heldKeys: Set<number> = new Set();
  triggeredNotes: Set<number> = new Set();

  constructor(loadedSampler: Tone.Sampler, cents: number) {
    this.sampler = loadedSampler;
    this.midiOffset = cents / 100;
  }

  keyDown({ midi, velocity = 1 }: { midi: number; velocity: number }) {
    const effectiveMidi = midi + this.midiOffset;
    this.sampler.triggerAttack(
      Tone.Frequency(effectiveMidi, "midi").toFrequency(),
      undefined,
      velocity,
    );
    this.triggeredNotes.add(effectiveMidi);
    this.heldKeys.add(effectiveMidi);
  }

  keyUp({ midi }: { midi: number }) {
    const effectiveMidi = midi + this.midiOffset;
    this.sampler.triggerRelease(
      Tone.Frequency(effectiveMidi, "midi").toFrequency(),
    );
    this.heldKeys.delete(effectiveMidi);
    if (!this.isPedalled) {
      this.triggeredNotes.delete(effectiveMidi);
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

  static async fromJsonUrl(url: string, volume = -6, cents: number) {
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

    return new SimplePiano(loadedSampler, cents);
  }
}

import * as Tone from "tone";
import * as C from "../constants";
import { Playable } from "./index";

async function urlMapFromMidijs(instrument: string, url: string) {
  return new Promise<Record<string, string>>(res => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => {
      script.remove();
      // @ts-ignore
      res(window.MIDI.Soundfont[instrument]);
    };
    document.head.appendChild(script);
  });
}

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

  static async factory(instrument: string, url: string) {
    const urls = await urlMapFromMidijs(instrument, url);

    const sampler = await new Promise<Tone.Sampler>(res => {
      const sampler = new Tone.Sampler({
        urls,
        release: 1,
        baseUrl: C.SAMPLES_URL,
        onload: () => {
          res(sampler);
        },
        //volume: -6,
      }).toDestination();
    });

    return new SimplePiano(sampler);
  }
}

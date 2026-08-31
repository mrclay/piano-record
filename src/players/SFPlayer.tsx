import { type Player } from "soundfont-player";
import { type Playable } from "./index";

export default class SFPlayer implements Playable {
  midiOffset: number;
  instrument: Player;
  isPedalled = false;
  nodes: Map<number, AudioBufferSourceNode> = new Map();
  heldKeys: Set<number> = new Set();
  triggeredNotes: Set<number> = new Set();

  constructor(instrument: Player, cents: number) {
    this.instrument = instrument;
    this.midiOffset = cents / 100;
  }

  keyDown({ midi, velocity = 1 }: { midi: number; velocity: number }) {
    const effectiveMidi = midi + this.midiOffset;

    // @ts-ignore
    const node: AudioBufferSourceNode = this.instrument.start(
      // @ts-ignore
      effectiveMidi,
      0,
      {
        gain: velocity,
      },
    );
    this.nodes.set(effectiveMidi, node);
    this.triggeredNotes.add(effectiveMidi);
    this.heldKeys.add(effectiveMidi);
  }

  keyUp({ midi }: { midi: number }) {
    const effectiveMidi = midi + this.midiOffset;

    const node = this.nodes.get(effectiveMidi);
    if (node) {
      node.stop();
      this.nodes.delete(effectiveMidi);
    }

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
        const node = this.nodes.get(midi);
        if (node) {
          node.stop();
          this.nodes.delete(midi);
        }
        this.triggeredNotes.delete(midi);
      });
  }

  stopAll() {
    this.nodes.forEach((node, midi) => {
      node.stop();
      this.nodes.delete(midi);
    });
    this.isPedalled = false;
    this.triggeredNotes = new Set();
    this.heldKeys = new Set();
  }
}

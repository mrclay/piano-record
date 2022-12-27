import { Player } from "soundfont-player";
import { Playable } from "./index";

export default class SFPlayer implements Playable {
  instrument: Player;
  isPedalled = false;
  nodes: Map<number, AudioBufferSourceNode> = new Map();
  heldKeys: Set<number> = new Set();
  triggeredNotes: Set<number> = new Set();

  constructor(instrument: Player) {
    this.instrument = instrument;
  }

  keyDown({ midi, velocity = 1 }: { midi: number; velocity: number }) {
    // @ts-ignore
    const node: AudioBufferSourceNode = this.instrument.start(midi, 0, {
      gain: velocity,
    });
    this.nodes.set(midi, node);
    this.triggeredNotes.add(midi);
    this.heldKeys.add(midi);
  }

  keyUp({ midi }: { midi: number }) {
    const node = this.nodes.get(midi);
    if (node) {
      node.stop();
      this.nodes.delete(midi);
    }

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

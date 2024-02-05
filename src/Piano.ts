import { EventTarget } from "./dom-event-target";
import * as C from "./constants";
import type { MidiOp, Op } from "./Ops";
import Ops from "./Ops";
import type { Playable } from "./players";
import { getShepardTones, isShepardToneActive } from "./players";
import NullPlayer from "~/players/NullPlayer";

export type ActiveKeys = Set<number>;

export type PianoActiveKeysListener = (activeKeys: ActiveKeys) => void;
export type PianoOperationListener = (op: Op) => void;
export type PianoResetListener = () => void;

export enum PianoEvents {
  activeKeysChange = "activeKeysChange",
  operation = "operation",
  reset = "reset",
}

/**
 * Fires "operation" with Ops operation
 * Fires "activeKeysChange" with activeKeys object
 * Fires "reset" for MIDI reset
 */
export default class Piano extends EventTarget {
  activeKeys: ActiveKeys = new Set();
  player: Playable;
  monitorMidi = true;
  shepardMode = true;

  constructor(player: Playable) {
    super();
    this.setupMidi();
    this.player = player;
    this.player.stopAll();
  }

  setPlayer(player: Playable) {
    this.player = player;
    this.player.stopAll();
  }

  startNote(note: number) {
    this.stopNote(note);

    const op = Ops.keyDownOperation(note);
    if (op) {
      this.performOperation(op);
    }
  }

  stopNote(note: number) {
    if (!this.activeKeys.has(note)) {
      return;
    }

    const op = Ops.keyUpOperation(note);
    if (op) {
      this.performOperation(op);
    }
  }

  stopAll() {
    this.activeKeys.forEach(note => this.stopNote(Number(note)));
  }

  performOperation(op: Op, sendOp = true) {
    sendOp && this.send(PianoEvents.operation, op);
    const [operation, midi] = op;

    switch (operation) {
      case C.OP_PEDAL_DOWN:
        return this.player.pedalDown();

      case C.OP_PEDAL_UP:
        return this.player.pedalUp();

      case C.OP_NOTE_DOWN:
        if (this.shepardMode) {
          getShepardTones(midi).forEach(obj => this.player.keyDown(obj));
        } else {
          this.player.keyDown({ midi, velocity: 1 });
        }
        this.activeKeys.add(midi);
        this.send(PianoEvents.activeKeysChange, new Set(this.activeKeys));
        return;

      case C.OP_NOTE_UP:
        // Important to mark this note inactive before checking
        // isShepardToneActive().
        this.activeKeys.delete(midi);
        if (this.shepardMode) {
          if (!isShepardToneActive(midi, this.activeKeys)) {
            // All notes of this chromatic pitch class have ended, so we can
            // release the shepard tones.
            getShepardTones(midi).forEach(obj => this.player.keyUp(obj));
          }
        } else {
          this.player.keyUp({ midi });
        }
        this.send(PianoEvents.activeKeysChange, new Set(this.activeKeys));
        return;

      default:
        return;
    }
  }

  setupMidi() {
    if (typeof navigator === "undefined") {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!navigator.requestMIDIAccess) {
      this.monitorMidi = false;
      return;
    }

    navigator.requestMIDIAccess().then(midiAccess => {
      midiAccess.inputs.forEach(input => {
        input.addEventListener("midimessage", e => {
          if (!this.monitorMidi || !(e instanceof MIDIMessageEvent)) {
            return;
          }

          // window.logMidi && console.log(e.data);

          if (e.data[0] === C.MIDI0_L1) {
            this.send(PianoEvents.reset);
            return;
          }

          const op = Ops.operationFromMidi(e.data as unknown as MidiOp);
          if (!op) {
            return;
          }
          this.performOperation(op);
        });
      });
    });
  }
}

let instance: Piano = new Piano(new NullPlayer());

export function getPiano() {
  return instance;
}

export function setPiano(piano: Piano) {
  instance = piano;
  return instance;
}

import EventTarget from "dom-event-target";
import { Piano as TonePiano } from "@tonejs/piano";

import * as C from "./constants";
import Ops, { MidiOp, Op } from "./Ops";

export type ActiveKeys = Record<string, boolean | undefined>;

export type PianoActiveKeysListener = (activeKeys: ActiveKeys) => void;
export type PianoOperationListener = (op: Op) => void;
export type PianoResetListener = () => void;

export enum PianoEvents {
  activeKeysChange = "activeKeysChange",
  operation = "operation",
  reset = "reset",
}

const tonePiano = new TonePiano({
  minNote: C.RANGE[0],
  maxNote: C.RANGE[1],
  velocities: C.VELOCITIES,
  release: C.USE_RELEASE,
  url: C.SAMPLES_URL,
}).toDestination();

tonePiano.load();

let activeKeys: ActiveKeys = Object.create(null);
for (let note = C.RANGE[0]; note <= C.RANGE[1]; note++) {
  activeKeys[note] = false;
}

/**
 * Fires "operation" with Ops operation
 * Fires "activeKeysChange" with activeKeys object
 * Fires "reset" for MIDI reset
 */
export default class Piano extends EventTarget {
  monitorMidi = true;

  constructor() {
    super();
    this.setupMidi();
    tonePiano.stopAll();
  }

  static getActiveKeys() {
    return {
      ...activeKeys,
    };
  }

  startNote(note: number) {
    this.stopNote(note);

    const op = Ops.keyDownOperation(note);
    if (op) {
      this.performOperation(op);
    }
  }

  stopNote(note: number) {
    if (!activeKeys[note]) {
      return;
    }

    const op = Ops.keyUpOperation(note);
    if (op) {
      this.performOperation(op);
    }
  }

  stopAll() {
    Object.keys(activeKeys).forEach(note => this.stopNote(Number(note)));
  }

  performOperation(op: Op, sendOp = true) {
    sendOp && this.send(PianoEvents.operation, op);

    switch (op[0]) {
      case C.OP_PEDAL_DOWN:
        return tonePiano.pedalDown();

      case C.OP_PEDAL_UP:
        return tonePiano.pedalUp();

      case C.OP_NOTE_DOWN:
        tonePiano.keyDown({ midi: op[1] });
        activeKeys[op[1]] = true;
        this.send(PianoEvents.activeKeysChange, activeKeys);
        return;

      case C.OP_NOTE_UP:
        tonePiano.keyUp({ midi: op[1] });
        activeKeys[op[1]] = false;
        this.send(PianoEvents.activeKeysChange, activeKeys);
        return;

      default:
        return;
    }
  }

  setupMidi() {
    if (!navigator.requestMIDIAccess) {
      this.monitorMidi = false;
      return;
    }

    navigator.requestMIDIAccess().then(midiAccess => {
      midiAccess.inputs.forEach(input => {
        input.addEventListener("midimessage", e => {
          if (!this.monitorMidi) {
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

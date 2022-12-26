import * as C from "./constants";
import Ops, { MidiOp, Op } from "./Ops";
import SimplePiano from "./SimplePiano";
import { RANGE } from "./constants";
import { EventTarget } from "./dom-event-target";

export type ActiveKeys = Set<number>;

export type PianoActiveKeysListener = (activeKeys: ActiveKeys) => void;
export type PianoOperationListener = (op: Op) => void;
export type PianoResetListener = () => void;

export enum PianoEvents {
  activeKeysChange = "activeKeysChange",
  operation = "operation",
  reset = "reset",
}

const tonePiano = new SimplePiano();

let allKeys: number[] = [];
for (let note = C.RANGE[0]; note <= C.RANGE[1]; note++) {
  allKeys.push(note);
}

export function pianoRange(): ReadonlyArray<number> {
  return allKeys;
}

let activeKeys: ActiveKeys = new Set();

function isShepardToneActive(midi: number, activeKeys: ActiveKeys) {
  let check = midi % 12;
  while (check <= C.RANGE[1]) {
    if (activeKeys.has(check)) {
      return true;
    }
    check += 12;
  }
  return false;
}

function getShepardTones(midi: number) {
  const zeroToEleven = midi % 12;
  // Added 1 to reduce volume a bit.
  let divisor = 24 + 3;

  return [
    {
      midi: 48 + zeroToEleven,
      velocityNumerator: zeroToEleven,
    },
    {
      midi: 60 + zeroToEleven,
      velocityNumerator: 12 + zeroToEleven,
    },
    {
      midi: 72 + zeroToEleven,
      velocityNumerator: 12 + (12 - zeroToEleven),
    },
    {
      midi: 84 + zeroToEleven,
      velocityNumerator: 12 - zeroToEleven,
    },
  ]
    .filter(el => el.velocityNumerator > 0)
    .map(({ midi, velocityNumerator }) => ({
      midi,
      velocity: velocityNumerator / divisor,
    }));
}

/**
 * Fires "operation" with Ops operation
 * Fires "activeKeysChange" with activeKeys object
 * Fires "reset" for MIDI reset
 */
export default class Piano extends EventTarget {
  monitorMidi = true;
  shepardMode = true;

  constructor() {
    super();
    this.setupMidi();
    tonePiano.stopAll();
  }

  static getActiveKeys(): ActiveKeys {
    return new Set(activeKeys);
  }

  startNote(note: number) {
    this.stopNote(note);

    const op = Ops.keyDownOperation(note);
    if (op) {
      this.performOperation(op);
    }
  }

  stopNote(note: number) {
    if (!activeKeys.has(note)) {
      return;
    }

    const op = Ops.keyUpOperation(note);
    if (op) {
      this.performOperation(op);
    }
  }

  stopAll() {
    activeKeys.forEach(note => this.stopNote(Number(note)));
  }

  performOperation(op: Op, sendOp = true) {
    sendOp && this.send(PianoEvents.operation, op);
    const [operation, midi] = op;

    switch (operation) {
      case C.OP_PEDAL_DOWN:
        return tonePiano.pedalDown();

      case C.OP_PEDAL_UP:
        return tonePiano.pedalUp();

      case C.OP_NOTE_DOWN:
        if (this.shepardMode) {
          getShepardTones(midi).forEach(obj => tonePiano.keyDown(obj));
        } else {
          tonePiano.keyDown({ midi, velocity: 1 });
        }
        activeKeys.add(midi);
        this.send(PianoEvents.activeKeysChange, new Set(activeKeys));
        return;

      case C.OP_NOTE_UP:
        // Important to mark this note inactive before checking
        // isShepardToneActive().
        activeKeys.delete(midi);
        if (this.shepardMode) {
          if (!isShepardToneActive(midi, activeKeys)) {
            // All notes of this chromatic pitch class have ended, so we can
            // release the shepard tones.
            getShepardTones(midi).forEach(obj => tonePiano.keyUp(obj));
          }
        } else {
          tonePiano.keyUp({ midi });
        }
        this.send(PianoEvents.activeKeysChange, new Set(activeKeys));
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

export function getPianoKeyLayout() {
  const whites = [];
  const blacks = [];
  let note;
  let mod;
  let left = 38;

  for (note = RANGE[0]; note <= RANGE[1]; note++) {
    mod = note % 12;
    if (mod === 1 || mod === 3 || mod === 6 || mod === 8 || mod === 10) {
      blacks.push({ note, left });
      left += 34;
      if (mod === 3 || mod === 10) {
        // skip a key
        left += 34;
      }
    } else {
      whites.push({ note });
    }
  }

  return { whites, blacks };
}

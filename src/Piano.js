import * as C from './constants';
import EventTarget from 'dom-event-target';
import Ops from './Ops';
import {Piano as TonePiano} from 'tone-piano';

const tonePiano = new TonePiano(C.RANGE, C.VELOCITIES, C.USE_RELEASE).toMaster();
tonePiano.load(C.RAWGIT_URL);

let activeKeys = {};
for (let note = C.RANGE[0]; note <= C.RANGE[1]; note++) {
  activeKeys[Ops.keyForNote(note)] = false;
}

/**
 * Fires "operation" with Ops operation
 * Fires "activeKeysChange" with activeKeys object
 * Fires "reset" for MIDI reset
 */
export default class Piano extends EventTarget {
  constructor() {
    super();

    // receive from MIDI?
    this.monitorMidi = true;

    this.setupMidi();
  }

  static getActiveKeys() {
    return activeKeys;
  }

  startNote(key) {
    this.stopNote(key);

    const note = Ops.noteForKey(key);
    const op = Ops.keyDownOperation(note);
    this.performOperation(op);
  }

  stopNote(key) {
    if (!activeKeys[key]) {
      return;
    }

    const note = Ops.noteForKey(key);
    const op = Ops.keyUpOperation(note);
    this.performOperation(op);
  }

  stopAll() {
    Object.keys(activeKeys).forEach((key) => {
      this.stopNote(key);
    });
  }

  performOperation(op, sendOp = true) {
    sendOp && this.send('operation', op);

    switch (op[0]) {
      case C.OP_PEDAL_DOWN:
        return tonePiano.pedalDown();

      case C.OP_PEDAL_UP:
        return tonePiano.pedalUp();

      case C.OP_NOTE_DOWN:
        tonePiano.keyDown(op[1]);
        activeKeys[Ops.keyForNote(op[1])] = true;
        this.send('activeKeysChange', activeKeys);
        return;

      case C.OP_NOTE_UP:
        tonePiano.keyUp(op[1]);
        activeKeys[Ops.keyForNote(op[1])] = false;
        this.send('activeKeysChange', activeKeys);
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

    navigator.requestMIDIAccess().then((midiAccess) => {
      midiAccess.inputs.forEach((input) => {
        input.addEventListener('midimessage', (e) => {

          if (!this.monitorMidi) {
            return;
          }

          window.logMidi && console.log(e.data);

          if (e.data[0] === C.MIDI0_L1) {
            this.send('reset');
            return;
          }

          const op = Ops.operationFromMidi(e.data);
          if (!op) {
            return;
          }
          this.performOperation(op);
        });
      });
    });
  }
}

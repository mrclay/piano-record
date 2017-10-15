import * as C from './constants';
import EventTarget from 'dom-event-target';
import Piano from './Piano';

let piano;

/**
 * Fires "progress"
 * Fires "stop"
 */
export default class PianoRecorder extends EventTarget {
  constructor(spec = {}) {
    super();

    if (!(spec.piano instanceof Piano)) {
      piano = piano || new Piano();
      spec.piano = piano;
    }

    this.progressPeriod = spec.progressPeriod || 40;
    this.piano = spec.piano;
    this.operations = spec.operations || [];
    this.playAllIntervals = [];
    this.progressInterval = null;
    this.firstTime = undefined;
    this.startedRecording = false;
    this.keyTimeouts = {};
    this.state = C.STOPPED;
  }

  setOperations(operations) {
    this.stop();
    this.operations = operations;
  }

  setState(state) {
    this.send('state', state);
    this.state = state;
  }

  getState() {
    return this.state;
  }

  clickNote(note, duration = 1000) {
    if (this.keyTimeouts[note]) {
      clearTimeout(this.keyTimeouts[note]);
      delete this.keyTimeouts[note];
    }

    this.piano.startNote(note);

    this.keyTimeouts[note] = setTimeout(() => {
      if (this.keyTimeouts[note]) {
        this.piano.stopNote(note);
      }
    }, duration);
  }

  onPianoOperation = op => {
    if (this.state !== C.RECORDING) {
      return;
    }

    this.recordOperation(op, (new Date()).getTime());
  };

  startRecording() {
    this.piano.stopAll();
    this.operations = [];
    this.firstTime = undefined;

    if (!this.startedRecording) {
      this.piano.addEventListener('operation', this.onPianoOperation);
      this.startedRecording = true;
    }

    this.setState(C.RECORDING);
    this.send("progress", 0);
  }

  getPiano() {
    return this.piano;
  }

  getOperations() {
    return this.operations;
  }

  recordOperation(op, timeInMs) {
    timeInMs = Math.round(timeInMs / C.TIME_RESOLUTION_DIVISOR);
    if (this.firstTime === undefined) {
      this.firstTime = timeInMs;
    }

    this.operations.push([op, (timeInMs - this.firstTime)]);
  }

  play() {
    const numOperations = this.operations.length;
    if (!numOperations) {
      return false;
    }

    const lastTime = this.operations[this.operations.length - 1][1] * C.TIME_RESOLUTION_DIVISOR;
    const startTime = (new Date()).getTime();
    let numPerformed = 0;

    this.progressInterval = setInterval(() => {
      const now = (new Date()).getTime();
      this.send("progress", (now - startTime) / lastTime);
    }, this.progressPeriod);

    this.operations.forEach(el => {
      // relying on the timer is awful, but tone-piano's "time" arguments just don't work.
      this.playAllIntervals.push(
        setTimeout(() => {
            this.piano.performOperation(el[0], false);
            numPerformed++;
            if (numPerformed === numOperations) {
              this.stop();
            }
          },
          el[1] * C.TIME_RESOLUTION_DIVISOR
        )
      );
    });

    this.setState(C.PLAYING);
    return true;
  }

  stop() {
    while (this.playAllIntervals.length) {
      let interval = this.playAllIntervals.pop();
      clearInterval(interval);
    }

    Object.keys(this.keyTimeouts).forEach(note => {
      clearTimeout(this.keyTimeouts[note]);
    });
    this.keyTimeouts = {};

    clearInterval(this.progressInterval);
    this.piano.stopAll();
    this.setState(C.STOPPED);
    this.send('stop');
    this.send("progress", 0);
  }
}

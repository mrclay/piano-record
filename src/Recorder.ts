import EventTarget from "dom-event-target";

import * as C from "./constants";
import { TimedOp, Op } from "./Ops";
import Piano, { PianoEvents } from "./Piano";

export type RecorderProgressListener = (progress: number) => void;
export type RecorderStateListener = (state: RecorderState) => void;
export type RecorderStopListener = () => void;

export enum RecorderEvent {
  progress = "progress",
  state = "state",
  stop = "stop",
}

export enum RecorderState {
  playing = "playing",
  stopped = "stopped",
  recording = "recording",
}

export default class Recorder extends EventTarget {
  firstTime: number | undefined;
  keyTimeouts: Record<string, number>;
  operations: TimedOp[];
  piano: Piano;
  playAllIntervals: number[];
  progressInterval: number | null;
  progressPeriod: number;
  startedRecording: boolean;
  state: RecorderState;

  constructor(spec = Object.create(null)) {
    super();

    if (!(spec.piano instanceof Piano)) {
      spec.piano = new Piano();
    }

    this.progressPeriod = spec.progressPeriod || 40;
    this.piano = spec.piano;
    this.operations = spec.operations || [];
    this.playAllIntervals = [];
    this.progressInterval = null;
    this.firstTime = undefined;
    this.startedRecording = false;
    this.keyTimeouts = Object.create(null);
    this.state = RecorderState.stopped;
  }

  setOperations(operations: TimedOp[]) {
    this.stop();
    this.operations = operations;
  }

  setState(state: RecorderState) {
    this.send(RecorderEvent.state, state);
    this.state = state;
  }

  getState() {
    return this.state;
  }

  clickNote(note: number, duration = 1000) {
    if (this.keyTimeouts[note]) {
      clearTimeout(this.keyTimeouts[note]);
      delete this.keyTimeouts[note];
    }

    this.piano.startNote(note);

    this.keyTimeouts[note] = window.setTimeout(() => {
      if (this.keyTimeouts[note]) {
        this.piano.stopNote(note);
      }
    }, duration);
  }

  onPianoOperation = (op: Op) => {
    if (this.state !== RecorderState.recording) {
      return;
    }

    this.recordOperation(op, new Date().getTime());
  };

  startRecording() {
    this.piano.stopAll();
    this.operations = [];
    this.firstTime = undefined;

    if (!this.startedRecording) {
      this.piano.addEventListener(PianoEvents.operation, this.onPianoOperation);
      this.startedRecording = true;
    }

    this.setState(RecorderState.recording);
    this.send(RecorderEvent.progress, 0);
  }

  getPiano() {
    return this.piano;
  }

  getOperations() {
    return this.operations;
  }

  recordOperation(op: Op, timeInMs: number) {
    timeInMs = Math.round(timeInMs / C.TIME_RESOLUTION_DIVISOR);
    if (this.firstTime === undefined) {
      this.firstTime = timeInMs;
    }

    this.operations.push([op, timeInMs - this.firstTime]);
  }

  play() {
    const numOperations = this.operations.length;
    if (!numOperations) {
      return false;
    }

    const lastTime =
      this.operations[this.operations.length - 1][1] *
      C.TIME_RESOLUTION_DIVISOR;

    const startTime = new Date().getTime();
    let numPerformed = 0;

    this.progressInterval = window.setInterval(() => {
      const now = new Date().getTime();
      this.send(RecorderEvent.progress, (now - startTime) / lastTime);
    }, this.progressPeriod);

    this.operations.forEach(el => {
      // relying on the timer is awful, but tone-piano's "time" arguments just don't work.
      this.playAllIntervals.push(
        window.setTimeout(() => {
          this.piano.performOperation(el[0], false);
          numPerformed++;
          if (numPerformed === numOperations) {
            this.stop();
          }
        }, el[1] * C.TIME_RESOLUTION_DIVISOR)
      );
    });

    this.setState(RecorderState.playing);
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
    this.keyTimeouts = Object.create(null);

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.piano.stopAll();
    this.setState(RecorderState.stopped);
    this.send(RecorderEvent.stop);
    this.send(RecorderEvent.progress, 0);
  }
}

import * as C from "./constants";
import { TimedOp, Op } from "./Ops";
import Piano, { PianoEvents } from "./Piano";
import { EventTarget } from "./dom-event-target";

export type RecorderProgressListener = (progress: number) => void;
export type RecorderStateListener = (state: RecorderState) => void;
export type RecorderStopListener = () => void;
export type RecorderCompleteListener = RecorderStopListener;

type RecorderEventTypes = {
  state: RecorderState;
  progress: number;
  complete: null;
  stop: null;
};

export enum RecorderState {
  playing = "playing",
  stopped = "stopped",
  recording = "recording",
}

export default class Recorder extends EventTarget<RecorderEventTypes> {
  firstTime: number | undefined;
  keyTimeouts: Record<string, number>;
  operations: TimedOp[];
  lastOperations: TimedOp[];
  piano: Piano;
  playAllIntervals: number[];
  progressInterval: number | null;
  progressPeriod: number;
  startedRecording: boolean;
  state: RecorderState;

  constructor(
    spec: {
      progressPeriod?: number;
      piano: Piano;
      operations?: TimedOp[];
    } = Object.create(null)
  ) {
    super();
    this.progressPeriod = spec.progressPeriod || 40;
    this.piano = spec.piano;
    this.operations = spec.operations || [];
    this.lastOperations = [];
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
    this.send("state", state);
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
    this.lastOperations = this.operations;
    this.operations = [];
    this.firstTime = undefined;

    if (!this.startedRecording) {
      this.piano.addEventListener(PianoEvents.operation, this.onPianoOperation);
      this.startedRecording = true;
    }

    this.setState(RecorderState.recording);
    this.send("progress", 0);
  }

  restartRecording() {
    this.piano.stopAll();

    const [, time] = this.operations[this.operations.length - 1];
    const dividedTime = Math.round(
      new Date().getTime() / C.TIME_RESOLUTION_DIVISOR
    );
    this.firstTime = dividedTime - time;

    if (!this.startedRecording) {
      this.piano.addEventListener(PianoEvents.operation, this.onPianoOperation);
      this.startedRecording = true;
    }

    this.setState(RecorderState.recording);
    this.send("progress", 0);
  }

  getPiano() {
    return this.piano;
  }

  getOperations() {
    return this.operations;
  }

  getLastOperations() {
    return this.lastOperations;
  }

  recordOperation(op: Op, timeInMs: number) {
    const dividedTime = Math.round(timeInMs / C.TIME_RESOLUTION_DIVISOR);
    if (this.firstTime === undefined) {
      this.firstTime = dividedTime;
    }

    this.operations.push([op, dividedTime - this.firstTime]);
  }

  play(speed = 1) {
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
      this.send("progress", (now - startTime) / lastTime);
    }, this.progressPeriod);

    this.operations.forEach(el => {
      // relying on the timer is awful, but tone-piano's "time" arguments just don't work.
      this.playAllIntervals.push(
        window.setTimeout(() => {
          this.piano.performOperation(el[0], false);
          numPerformed++;
          if (numPerformed === numOperations) {
            this.send("complete", null);
            this.stop();
          }
        }, el[1] * C.TIME_RESOLUTION_DIVISOR * (1 / speed))
      );
    });

    this.setState(RecorderState.playing);
    return true;
  }

  stop() {
    if (this.operations.length === 0 && this.lastOperations.length) {
      this.operations = this.lastOperations;
    }

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
    this.send("stop", null);
    this.send("progress", 0);
  }
}

import * as C from "./constants";
import { TimedOp, Op } from "./Ops";
import Piano from "./Piano";
import { EventTarget } from "./dom-event-target";

type RecorderEvents = {
  state: RecorderState;
  progress: number;
  complete: { plays: number };
  stop: null;
};

export type RecorderListener<K extends keyof RecorderEvents> = (
  evt: RecorderEvents[K],
) => void;

export enum RecorderState {
  playing = "playing",
  stopped = "stopped",
  recording = "recording",
}

export default class Recorder extends EventTarget<RecorderEvents> {
  firstTime: number | undefined;
  keyTimeouts: Record<string, number> = Object.create(null);
  operations: TimedOp[];
  lastOperations: TimedOp[] = [];
  piano: Piano;
  #plays = 0;
  playAllIntervals: number[] = [];
  progressInterval: number | null = null;
  progressPeriod: number;
  repeatAfterMs: number | null = null;
  repeatTimeout = 0;
  speed = 1;
  startedRecording = false;
  state = RecorderState.stopped;

  constructor(
    spec: {
      progressPeriod?: number;
      piano: Piano;
      operations?: TimedOp[];
    } = Object.create(null),
  ) {
    super();
    this.progressPeriod = spec.progressPeriod || 40;
    this.piano = spec.piano;
    this.operations = spec.operations || [];
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
      this.piano.addEventListener("operation", this.onPianoOperation);
      this.startedRecording = true;
    }

    this.setState(RecorderState.recording);
    this.send("progress", 0);
  }

  restartRecording() {
    this.piano.stopAll();

    const [, time] = this.operations[this.operations.length - 1]!;
    const dividedTime = Math.round(
      new Date().getTime() / C.TIME_RESOLUTION_DIVISOR,
    );
    this.firstTime = dividedTime - time;

    if (!this.startedRecording) {
      this.piano.addEventListener("operation", this.onPianoOperation);
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

  play() {
    const numOperations = this.operations.length;
    if (!numOperations) {
      return false;
    }

    const lastTime =
      this.operations[this.operations.length - 1]![1] *
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
        window.setTimeout(
          () => {
            this.piano.performOperation(el[0], false);
            numPerformed++;
            if (numPerformed === numOperations) {
              this.#plays += 1;
              this.send("complete", { plays: this.#plays });
              // No event handler stopped us
              this.stop(true);
            }
          },
          el[1] * C.TIME_RESOLUTION_DIVISOR * (1 / this.speed),
        ),
      );
    });

    this.setState(RecorderState.playing);
    return true;
  }

  stop(justCompleted = false) {
    if (this.operations.length === 0 && this.lastOperations.length) {
      this.operations = this.lastOperations;
    }

    while (this.playAllIntervals.length) {
      let interval = this.playAllIntervals.pop();
      window.clearInterval(interval);
    }

    Object.keys(this.keyTimeouts).forEach(note => {
      window.clearTimeout(this.keyTimeouts[note]);
    });
    this.keyTimeouts = Object.create(null);

    if (this.repeatTimeout) {
      window.clearTimeout(this.repeatTimeout);
    }

    if (this.progressInterval) {
      window.clearInterval(this.progressInterval);
    }
    this.piano.stopAll();

    if (justCompleted && this.repeatAfterMs) {
      this.repeatTimeout = window.setTimeout(
        () => this.play(),
        this.repeatAfterMs,
      );
      return;
    }

    this.setState(RecorderState.stopped);
    this.send("stop", null);
    this.send("progress", 0);
    this.#plays = 0;
  }
}

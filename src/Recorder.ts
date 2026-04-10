import * as Tone from "tone";
import * as C from "./constants";
import { type TimedOp, type Op } from "./Ops";
import Piano from "./Piano";
import { EventTarget } from "./dom-event-target";
import { OP_NOTE_DOWN, OP_NOTE_UP } from "./constants";
import type { Note } from "tone/Tone/core/type/NoteUnits.ts";

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

    interface ValueType {
      time: Tone.TimeClass;
      note: Note;
      comm: number;
    }

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        partials: [0, 2, 3, 4],
      },
    }).toDestination();

    const multiplyForSeconds = C.TIME_RESOLUTION_DIVISOR / this.speed / 1000;
    const part = new Tone.Part<ValueType>(
      (time, value: ValueType) => {
        if (value.comm === OP_NOTE_DOWN) {
          synth.triggerAttack(value.note, time);
        } else if (value.comm === OP_NOTE_UP) {
          synth.triggerRelease(value.note, time);
        }
      },
      this.operations.map(el => {
        const [op, time] = el;
        const [comm, midiValue] = op;
        return {
          time: Tone.Time(time * multiplyForSeconds, "s"),
          note: Tone.Frequency(midiValue, "midi").toNote(),
          comm,
        };
      }),
    );
    part.start(0);
    Tone.getTransport().start();
    return;

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

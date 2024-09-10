import { EventTarget } from "./dom-event-target";
import Piano, { ActiveKeys } from "./Piano";
import * as Tone from "tone";

export interface SequencerEvents {
  repeat: { plays: number };
  step: { step: number };
  start: null;
  stop: null;
}

export type SequencerListener<K extends keyof SequencerEvents> = (
  evt: SequencerEvents[K]
) => void;

const sequencerDefaults = {
  bpm: 60,
  bps: 2,
  stepData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => [] as number[]),
  joinData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => [] as number[]),
};

export class Sequencer extends EventTarget<SequencerEvents> {
  bpm = sequencerDefaults.bpm;
  bps = sequencerDefaults.bps;
  #step = 0;
  #playing = false;
  #stepTimeout = 0;
  piano: Piano;
  #plays = 0;
  activeKeys: ActiveKeys = new Set();
  stepData = sequencerDefaults.stepData;
  joinData = sequencerDefaults.joinData;

  constructor(piano: Piano) {
    super();
    this.piano = piano;
  }

  reset() {
    this.stop();
    Object.assign(this, sequencerDefaults);
  }

  isPlaying() {
    return Boolean(this.#playing);
  }

  getStep() {
    return this.#step;
  }

  getNumSteps() {
    return this.stepData.length;
  }

  setNumSteps(steps: number) {
    while (this.stepData.length < steps) {
      this.stepData.push([]);
      this.joinData.push([]);
    }
    while (this.stepData.length > steps) {
      this.stepData.pop();
      this.joinData.pop();
    }
  }

  playStep() {
    const currentNotes = this.stepData[this.#step];
    const currentJoins = this.joinData[this.#step];

    // Keep track of which are started
    const bannedNotes: ActiveKeys = new Set();
    // Handle notes already playing

    // Why the new Set()? Because we need to play new notes in the
    // callback. But if we do so, activeKeys.forEach will get called
    // again for the new note, resulting in an infinite loop.
    new Set(this.piano.activeKeys).forEach(note => {
      const willJoin = currentJoins.includes(note);
      const willPlay = currentNotes.includes(note);

      if (willPlay) {
        bannedNotes.add(note);
        if (willJoin) {
          // Let it ring
        } else {
          this.piano.stopNote(note);
          this.piano.startNote(note);
        }
      } else {
        this.piano.stopNote(note);
      }
    });

    // Start notes that still need starting
    currentNotes.forEach(note => {
      if (!bannedNotes.has(note)) {
        this.piano.startNote(note);
      }
    });

    this.activeKeys = new Set(currentNotes);

    if (this.#playing) {
      const delay = (60 / this.bpm) * this.bps * 1000;
      this.#stepTimeout = window.setTimeout(this.#incPlay.bind(this), delay);
    }

    this.send("step", { step: this.#step });
  }

  #incPlay() {
    this.#step = (this.#step + 1) % this.stepData.length;
    if (this.#step === 0) {
      this.#plays += 1;
      this.send("repeat", { plays: this.#plays });
      if (!this.#playing) {
        return;
      }
    }
    this.playStep();
  }

  async start(step = 0) {
    this.#playing = true;
    this.#plays = 0;
    this.#step = step;
    this.send("start", null);
    await Tone.start();
    this.playStep();
  }

  stop() {
    this.#playing = false;
    window.clearTimeout(this.#stepTimeout);
    this.piano.stopAll();
    this.send("stop", null);
  }
}

function parseStream(stream: string) {
  let m;

  m = stream.match(/^v4,(\d+),(0p\d+|[1-4]),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]),
      bps: Number(m[2].replace("p", ".")),
      version: 4,
      raw: m[3],
    };
  }

  m = stream.match(/^v3,(\d+),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]),
      bps: 1,
      version: 3,
      raw: m[2],
    };
  }

  m = stream.match(/^v2,(\d+),([10]),([10]),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]),
      bps: 1,
      version: 2,
      raw: m[4],
    };
  }

  m = stream.match(/^v1,(\d+),([10]),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]),
      bps: 1,
      version: 1,
      raw: m[3],
    };
  }

  return {
    bpm: 0,
    bps: 1,
    version: 3,
    raw: null,
  };
}

export function sequenceFromStream(
  stream: string,
  offset = 0
): {
  bpm: number;
  bps: number;
  newStepData: Array<number[]> | false;
  newJoinData: Array<number[]> | false;
} {
  let { bpm, bps, version, raw } = parseStream(stream);

  if (!raw) {
    return { bpm, bps, newStepData: false, newJoinData: false };
  }

  const newJoinData: Array<number[]> = [];
  const newStepData = raw.split("-").map(str => {
    const notes: number[] = [];
    const joins: number[] = [];

    let chunk = "";
    const chunkLen = version > 2 ? 3 : 2;

    while ((chunk = str.substr(notes.length * chunkLen, chunkLen))) {
      let isJoin = false;
      if (version > 2) {
        isJoin = chunk[0] === "j";
        chunk = chunk.substr(1);
      }

      chunk = chunk.replace(/^0/, "");
      const note = parseInt(chunk, 16) + offset;

      notes.push(note);
      if (isJoin) {
        joins.push(note);
      }
    }

    newJoinData.push(joins);
    return notes;
  });

  return { bpm, bps, newStepData, newJoinData };
}

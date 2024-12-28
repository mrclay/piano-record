import * as Tone from "tone";
import * as C from "./constants";
import { EventTarget } from "./dom-event-target";
import Piano, { ActiveKeys } from "./Piano";
import { midiFromNoteOctave, noteOctaveFromMidi } from "./music-theory/Note";

export interface SequencerEvents {
  repeat: { plays: number };
  step: { step: number };
  start: null;
  stop: null;
}

export type SequencerListener<K extends keyof SequencerEvents> = (
  evt: SequencerEvents[K],
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

  setStep(step: number) {
    this.#step = (step + this.stepData.length) % this.stepData.length;
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
        // An event handler stopped
        return;
      }
    }
    this.playStep();
  }

  async start() {
    this.#playing = true;
    this.#plays = 0;
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

  toTextLines() {
    let out: string[] = [];

    this.stepData.forEach((notes, step) => {
      let joinLine = "";
      let noteLine = "";
      for (let i = C.RANGE[0]; i <= C.RANGE[1]; i++) {
        const joinSpace = this.joinData[step].includes(i) ? "|  " : "   ";
        let noteSpace;
        if (notes.includes(i)) {
          noteSpace = noteOctaveFromMidi(i);
          if (noteSpace.length === 2) {
            noteSpace += "-";
          }
        } else {
          noteSpace = "---";
        }
        joinLine += joinSpace;
        noteLine += noteSpace;
      }

      noteLine = noteLine.replace(/^(-+)(.*)/, (m, m1, m2) => {
        return m1.replaceAll("-", " ") + m2;
      });
      noteLine = noteLine.replace(/-+$/, "");
      out.push(joinLine.trimEnd(), noteLine.trimEnd());
    });

    return out;
  }

  setStepsFromText(text: string) {
    const stepData: number[][] = [];
    const joinData: number[][] = [];
    const lines = text.split(/\r?\n/);
    const regex = /[A-G]([b#])?\d/gi;

    do {
      const joinLine = lines.shift();
      if (typeof joinLine === "string" && joinLine.includes("/chord/")) {
        stepData.push(
          joinLine.split("/chord/")[1].split("/")[0].split(",").map(Number),
        );
        joinData.push([]);
        continue;
      }

      const stepLine = lines.shift();
      if (typeof joinLine !== "string" || typeof stepLine !== "string") {
        break;
      }

      const found = Array.from(stepLine.matchAll(regex), m => {
        if (typeof m.index !== "number") {
          throw new Error();
        }
        const midi = midiFromNoteOctave(m[0]);
        const isJoin = joinLine.charAt(m.index) === "|";
        return { midi, isJoin };
      });
      stepData.push(found.map(el => el.midi));
      joinData.push(found.filter(el => el.isJoin).map(el => el.midi));
    } while (lines.length);

    this.stepData = stepData;
    this.joinData = joinData;
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
  offset = 0,
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

    if (str === ".") {
      newJoinData.push(joins);
      return notes;
    }

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

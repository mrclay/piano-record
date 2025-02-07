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
  rhythm: [1, 1],
  stepData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => [] as number[]),
  joinData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => [] as number[]),
  groups: [{ start: 0, length: 8 }],
};

function allStepsFromGroups(groups: typeof sequencerDefaults.groups) {
  return groups.reduce<number[]>((acc, curr) => {
    for (let i = 0; i < curr.length; i++) {
      acc.push(curr.start + i);
    }
    return acc;
  }, []);
}

export class Sequencer extends EventTarget<SequencerEvents> {
  activeKeys: ActiveKeys = new Set();
  /** Beats per minute */
  bpm = sequencerDefaults.bpm;
  /** Beats per step */
  bps = sequencerDefaults.bps;
  rhythm = sequencerDefaults.rhythm;
  piano: Piano;
  stepData = sequencerDefaults.stepData;
  joinData = sequencerDefaults.joinData;

  #allSteps = allStepsFromGroups(sequencerDefaults.groups);
  #delaysCache = {
    forRhythm: [] as number[],
    forBpm: 0,
    forBps: 0,
    delays: [] as number[],
  };
  #groups = sequencerDefaults.groups;
  #playing = false;
  #plays = 0;
  #step = 0;
  #stepTimeout = 0;

  constructor(piano: Piano) {
    super();
    this.piano = piano;
  }

  override reset() {
    this.stop();
    Object.assign(this, sequencerDefaults);
  }

  isPlaying() {
    return Boolean(this.#playing);
  }

  getStep() {
    return this.#step;
  }

  getDataIdx() {
    return this.#allSteps[this.#step];
  }

  getActiveGroupIdx() {
    let offset = 0;
    for (let i = 0; i < this.#groups.length; i++) {
      const group = this.#groups[i];
      if (this.#step < group.length + offset) {
        return i;
      }

      offset += group.length;
    }

    // Never reached.
    return 0;
  }

  setStep(step: number) {
    this.#step = (step + this.stepData.length) % this.stepData.length;
  }

  getNumSteps() {
    return this.stepData.length;
  }

  setNumSteps(steps: number) {
    while (this.stepData.length < steps) {
      const idx = this.stepData.length - 1;
      this.#groups.forEach(group => {
        // If the group contains the old index, extend its length
        if (group.start <= idx && group.start + group.length >= idx) {
          group.length += 1;
        }
      });

      this.stepData.push([]);
      this.joinData.push([]);
    }
    while (this.stepData.length > steps) {
      const idx = this.stepData.length - 1;
      this.#groups.forEach(group => {
        // If the group contains the old index, reduce its length
        if (group.start <= idx && group.start + group.length >= idx) {
          group.length -= 1;
        }
      });
      this.#groups = this.#groups.filter(el => el.length > 0);

      this.stepData.pop();
      this.joinData.pop();
    }

    this.#allSteps = allStepsFromGroups(this.#groups);
    console.log(this.#groups);
  }

  getGroups() {
    return this.#groups;
  }

  setGroups(groups: typeof sequencerDefaults.groups) {
    const max = this.stepData.length - 1;
    this.#groups = groups.map(el => ({
      start: Math.min(Math.max(el.start, 0), max),
      length: Math.min(Math.max(el.length, 1), this.stepData.length),
    }));
    this.#allSteps = allStepsFromGroups(this.#groups);
  }

  // Returns changed data index
  copyStep(dataIdx: number) {
    this.stepData = [
      ...this.stepData.slice(0, dataIdx),
      this.stepData[dataIdx]!.slice(),
      ...this.stepData.slice(dataIdx),
    ];
    this.joinData = [
      ...this.joinData.slice(0, dataIdx + 1),
      this.stepData[dataIdx]!.slice(),
      ...this.joinData.slice(dataIdx + 1),
    ];

    // Update groups.
    this.#groups.forEach(group => {
      // If the group contains the index, increase its length
      if (group.start <= dataIdx && group.start + group.length >= dataIdx) {
        group.length += 1;
      }
    });
    this.#allSteps = allStepsFromGroups(this.#groups);

    // If it would add an empty step, chop off one to maintain the length.
    if (
      this.joinData[this.joinData.length - 1]!.length === 0 &&
      this.stepData[this.stepData.length - 1]!.length === 0
    ) {
      const removedIdx = this.stepData.length;
      this.joinData.pop();
      this.stepData.pop();

      // Update groups.
      this.#groups.forEach(group => {
        // If the group contains the last index (removed), decrease its length
        if (
          group.start <= this.stepData.length &&
          group.start + group.length >= this.stepData.length
        ) {
          group.length -= 1;
        }
      });
      this.#groups = this.#groups.filter(el => el.length > 0);
      this.#allSteps = allStepsFromGroups(this.#groups);
    }

    return [dataIdx + 1];
  }

  // Returns changed data index
  removeStep(dataIdx: number) {
    this.stepData = [...this.stepData];
    this.joinData = [...this.joinData];
    this.stepData.splice(dataIdx, 1);
    this.joinData.splice(dataIdx, 1);

    // Update groups.
    this.#groups.forEach(group => {
      // If the group contains the old index, reduce its length
      if (group.start <= dataIdx && group.start + group.length >= dataIdx) {
        group.length -= 1;
      }
    });
    this.#groups = this.#groups.filter(el => el.length > 0);
    this.#allSteps = allStepsFromGroups(this.#groups);

    return [Math.max(0, dataIdx - 1)];
  }

  playStep(injectedPiano: Piano | null = null) {
    // Schedule this to be re-called, then do work.
    if (this.#playing) {
      this.#manageDelaysCache();
      const delay = this.#delaysCache.delays[this.#step % this.rhythm.length];
      this.#stepTimeout = window.setTimeout(this.#incPlay.bind(this), delay);
    }

    const piano = injectedPiano || this.piano;

    const dataStep = this.#allSteps[this.#step];

    const currentNotes = this.stepData[dataStep]!;
    const currentJoins = this.joinData[dataStep]!;

    // Keep track of which are started
    const bannedNotes: ActiveKeys = new Set();
    // Handle notes already playing

    // Why the new Set()? Because we need to play new notes in the
    // callback. But if we do so, activeKeys.forEach will get called
    // again for the new note, resulting in an infinite loop.
    new Set(piano.activeKeys).forEach(note => {
      const willJoin = currentJoins.includes(note);
      const willPlay = currentNotes.includes(note);

      if (willPlay) {
        bannedNotes.add(note);
        if (willJoin) {
          // Let it ring
        } else {
          piano.stopNote(note);
          piano.startNote(note);
        }
      } else {
        piano.stopNote(note);
      }
    });

    // Start notes that still need starting
    currentNotes.forEach(note => {
      if (!bannedNotes.has(note)) {
        piano.startNote(note);
      }
    });

    if (injectedPiano) {
      // Using injected piano for MIDI rendering. No need for more.
      return;
    }

    this.activeKeys = new Set(currentNotes);

    this.send("step", { step: dataStep });
  }

  #manageDelaysCache() {
    if (
      this.#delaysCache.forRhythm !== this.rhythm ||
      this.#delaysCache.forBpm !== this.bpm ||
      this.#delaysCache.forBps !== this.bps
    ) {
      // Rebuild cache
      const fullDelay = (60 / this.bpm) * this.bps * 1000 * this.rhythm.length;
      const denomenator = this.rhythm.reduce((acc, curr) => acc + curr, 0);
      this.#delaysCache.delays = this.rhythm.map(
        numerator => fullDelay * (numerator / denomenator),
      );

      // For future checks
      this.#delaysCache.forRhythm = this.rhythm;
      this.#delaysCache.forBpm = this.bpm;
      this.#delaysCache.forBps = this.bps;
    }
  }

  #incPlay() {
    this.#step = (this.#step + 1) % this.#allSteps.length;
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
    if (this.#playing) {
      this.stop();
    }
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
        const joinSpace = this.joinData[step]!.includes(i) ? "|  " : "   ";
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

      noteLine = noteLine.replace(/^(-+)(.*)/, (_, m1, m2) => {
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
          joinLine.split("/chord/")[1]!.split("/")[0]!.split(",").map(Number),
        );
        joinData.push([]);
        continue;
      }

      const stepLine = lines.shift();
      if (typeof joinLine !== "string" || typeof stepLine !== "string") {
        break;
      }

      const found = Array.from(stepLine.matchAll(regex), m => {
        const midi = midiFromNoteOctave(m[0]);
        const isJoin = joinLine.charAt(m.index) === "|";
        return { midi, isJoin };
      });
      stepData.push(found.map(el => el.midi));
      joinData.push(found.filter(el => el.isJoin).map(el => el.midi));
    } while (lines.length);

    this.stepData = stepData;
    this.joinData = joinData;
    this.#groups = [{ start: 0, length: stepData.length }];
    this.#allSteps = allStepsFromGroups(this.#groups);
  }

  // https://en.wikipedia.org/wiki/General_MIDI
  async toMidi({ program = 1 }: { program: number }) {
    const [jzzModule, smfModule] = await Promise.all([
      // @ts-ignore
      import("jzz"),
      // @ts-ignore
      import("jzz-midi-smf"),
    ]);
    // @ts-ignore
    const JZZ = jzzModule.default;
    const SMF = smfModule.default;

    // Add SMF as a JZZ.MIDI helper
    SMF(JZZ);

    interface SMFTrack {
      add(tick: number, evt: ReturnType<typeof JZZ.MIDI.program>): this;
    }
    interface SMFInstance {
      push(track: SMFTrack): void;
      toInt8Array(rmiFormat: boolean): Int8Array;
    }

    // @ts-ignore
    const smf: SMFInstance = new JZZ.MIDI.SMF(0, 96); // type 0, 96 ticks per quarter note
    // @ts-ignore
    const trk: SMFTrack = new JZZ.MIDI.SMF.MTrk();
    smf.push(trk);

    const channel = 0;

    // add contents:
    trk
      .add(0, JZZ.MIDI.program(channel, program))
      .add(0, JZZ.MIDI.smfBPM(this.bpm));

    let tick = 0;
    const piano = new Piano({
      keyDown({ midi }) {
        trk.add(tick, JZZ.MIDI.noteOn(channel, midi, 127));
      },
      keyUp({ midi }) {
        trk.add(tick, JZZ.MIDI.noteOff(channel, midi));
      },
      pedalDown: () => 0,
      pedalUp: () => 0,
      stopAll: () => 0,
    });

    for (let i = 0; i < this.#allSteps.length; i++) {
      this.#step = i;
      this.playStep(piano);
      tick += 96 * this.bps;
    }

    trk.add(tick, JZZ.MIDI.smfEndOfTrack());

    return new Blob([smf.toInt8Array(false)]);
  }
}

function parseStream(stream: string) {
  let m;

  m = stream.match(/^v5,([0-9-]+),(\d+),(0p\d+|[1-4]),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[2]!),
      bps: Number(m[3]!.replace("p", ".")),
      rhythm: m[1]!.split("-").map(Number),
      version: 5,
      raw: m[4]! as string,
    };
  }

  m = stream.match(/^v4,(\d+),(0p\d+|[1-4]),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]!),
      bps: Number(m[2]!.replace("p", ".")),
      version: 4,
      raw: m[3]! as string,
    };
  }

  m = stream.match(/^v3,(\d+),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]!),
      bps: 1,
      version: 3,
      raw: m[2]! as string,
    };
  }

  m = stream.match(/^v2,(\d+),([10]),([10]),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]!),
      bps: 1,
      version: 2,
      raw: m[4]! as string,
    };
  }

  m = stream.match(/^v1,(\d+),([10]),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]!),
      bps: 1,
      version: 1,
      raw: m[3]! as string,
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
  rhythm: number[];
  newStepData: Array<number[]> | false;
  newJoinData: Array<number[]> | false;
  groups: typeof sequencerDefaults.groups;
} {
  let {
    bpm,
    bps,
    rhythm = sequencerDefaults.rhythm,
    version,
    raw,
  } = parseStream(stream);

  const groupPieces = (raw || "").split(",");
  raw = groupPieces.shift() || null;

  if (!raw) {
    return {
      bpm,
      bps,
      rhythm,
      newStepData: false,
      newJoinData: false,
      groups: [],
    };
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

  const groups = groupPieces.length
    ? groupPieces.map(piece => {
        const m = piece.match(/^(\d+)\.(\d+)$/);
        if (!m) {
          throw new Error("Invalid group string");
        }
        return { start: parseInt(m[1]), length: parseInt(m[2]) };
      })
    : [{ start: 0, length: newStepData.length }];

  return {
    bpm,
    bps,
    rhythm,
    newStepData,
    newJoinData,
    groups,
  };
}

export function streamFromSong(
  bpm: number,
  bps: number,
  rhythm: number[],
  stepData: Array<number[]>,
  joinData: Array<number[]>,
  groups: typeof sequencerDefaults.groups,
) {
  let out = "";

  if (JSON.stringify(rhythm) === "[1,1]") {
    out += "v4,";
  } else {
    out += `v5,${rhythm.join("-")},`;
  }

  out += `${bpm},${String(bps).replace(".", "p")},`;

  out += stepData
    .map(
      (stepNotes, stepIdx) =>
        stepNotes
          .map(note => {
            const str = note.toString(16);
            const j = joinData[stepIdx]!.includes(note) ? "j" : "p";
            return j + (str.length < 2 ? "0" + str : str);
          })
          .join("") || ".",
    )
    .join("-");

  if (
    groups.length === 1 &&
    groups[0]?.start === 0 &&
    groups[0]?.length === stepData.length
  ) {
    // Can be rebuilt from stepData, no need in URL.
  } else {
    out += "," + groups.map(el => `${el.start}.${el.length}`).join(",");
  }

  return out;
}

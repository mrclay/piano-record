import { EventTarget } from "./dom-event-target";
import Piano, { ActiveKeys } from "./Piano";

export const initialSequenceConfig = {
  bpm: 60,
  bps: 2,
  step: 0 as number | undefined,
  stepData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => [] as number[]),
  joinData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => [] as number[]),
};

type SequencerConfig = typeof initialSequenceConfig & {
  piano: Piano;
};

export function playSequence(config: SequencerConfig) {
  const { stepData, joinData, piano } = config;
  let playing = false;
  let bpm = config.bpm;
  let bps = config.bps;
  let step = Math.max(0, config.step || 0);
  let stepTimeout = 0;
  let activeKeys: ActiveKeys = new Set();

  const eventTarget = new EventTarget<{
    step: { step: number };
    start: null;
    stop: null;
  }>();

  function playStep() {
    const currentNotes = stepData[step];
    const currentJoins = joinData[step];

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

    activeKeys = new Set(currentNotes);

    if (playing) {
      const delay = (60 / bpm) * bps * 1000;
      stepTimeout = window.setTimeout(incPlay, delay);
    }

    eventTarget.send("step", {
      step,
    });
  }

  function incPlay() {
    step = (step + 1) % stepData.length;
    playStep();
  }

  function start() {
    playing = true;
    eventTarget.send("start", null);
    playStep();
  }

  function stop() {
    playing = false;
    window.clearTimeout(stepTimeout);
    piano.stopAll();
    eventTarget.send("stop", null);
  }

  function setBps(val: number) {
    bps = val;
  }

  function setBpm(val: number) {
    bpm = val;
  }

  function getActiveKeys() {
    return activeKeys;
  }

  return { getActiveKeys, eventTarget, start, stop, setBpm, setBps };
}

function parseStream(stream: string) {
  let m;

  m = stream.match(/^v4,(\d+),([1-4]),(.+)$/);
  if (m) {
    return {
      bpm: parseInt(m[1]),
      bps: parseInt(m[2]),
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

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Paths from "../Paths";
import Piano, { ActiveKeys } from "../Piano";
import Keyboard from "../ui/Keyboard";
import Template from "./Template";
import Preview from "../ui/Preview";
import Saver from "../ui/Saver";

function streamFromSong(
  bpm: number,
  stepData: Array<number[]>,
  joinData: Array<number[]>
) {
  let out = `v3,${bpm},`;

  out += stepData
    .map((stepNotes, stepIdx) =>
      stepNotes
        .map(note => {
          const str = note.toString(16);
          const j = joinData[stepIdx].includes(note) ? "j" : "p";
          return j + (str.length < 2 ? "0" + str : str);
        })
        .join("")
    )
    .join("-");
  return out;
}

function parseStream(stream: string) {
  let m = stream.match(/^v1,(\d+),([10]),(.+)$/);
  if (m) {
    return {
      bpm: Number(m[1]),
      version: 1,
      raw: m[3],
    };
  }

  m = stream.match(/^v2,(\d+),([10]),([10]),(.+)$/);
  if (m) {
    return {
      bpm: Number(m[1]),
      version: 2,
      raw: m[4],
    };
  }

  m = stream.match(/^v3,(\d+),(.+)$/);
  if (m) {
    return {
      bpm: Number(m[1]),
      version: 3,
      raw: m[2],
    };
  }

  return {
    bpm: 0,
    version: 3,
    raw: null,
  };
}

function songFromStream(stream: string): {
  bpm: number;
  newStepData: Array<number[]> | false;
  newJoinData: Array<number[]> | false;
} {
  let { bpm, version, raw } = parseStream(stream);

  if (!raw) {
    return { bpm, newStepData: false, newJoinData: false };
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
      const note = parseInt(chunk, 16);

      notes.push(note);
      if (isJoin) {
        joins.push(note);
      }
    }

    newJoinData.push(joins);
    return notes;
  });

  return { bpm, newStepData, newJoinData };
}

const initial = {
  bpm: 60,
  numSteps: 8,
  stepData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => []),
  joinData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => []),
};

let playInterval: number;

export default function SequencePage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();

  const piano = useMemo(() => new Piano(), []);

  const [playing, setPlaying] = useState(false);
  const [internalStep, setStep] = useState(0);
  const step = playing ? internalStep : -1;

  const [bpm, setBpm] = useState(initial.bpm);
  const [numSteps, setNumSteps] = useState(initial.numSteps);
  const [stepData, setStepData] = useState<Array<number[]>>(initial.stepData);
  const [joinData, setJoinData] = useState<Array<number[]>>(initial.joinData);

  const currentNotes = playing ? stepData[step] || [] : [];
  const currentJoins = joinData[step];
  const activeKeys = currentNotes.reduce(
    (prev, curr) => ({
      ...prev,
      [curr]: true,
    }),
    {}
  );

  function handleStart() {
    setPlaying(true);
    setStep(0);
  }

  function handleStop() {
    piano.stopAll();
    setPlaying(false);
  }

  function reset() {
    setBpm(initial.bpm);
    setNumSteps(initial.numSteps);
    setStepData(initial.stepData);
    setJoinData(initial.joinData);
    setStep(internalStep % initial.numSteps);
    setPlaying(false);
  }

  function play(currentNotes: number[], currentJoins: number[]) {
    // Keep track of which are started
    const bannedNotes: ActiveKeys = {};
    // Handle notes already playing
    Object.entries(Piano.getActiveKeys())
      .filter(([k, v]) => v === true)
      .forEach(([noteStr]) => {
        const note = Number(noteStr);
        const willJoin = currentJoins.includes(note);
        const willPlay = currentNotes.includes(note);

        if (willPlay) {
          bannedNotes[note] = true;
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
      if (!bannedNotes[note]) {
        piano.startNote(note);
      }
    });
  }

  function share() {
    navigate(
      Paths.sequencePrefix(`/songs/${streamFromSong(bpm, stepData, joinData)}`)
    );
  }

  // Handle load
  useEffect(() => {
    const stream = params.stream;
    if (typeof stream === "string") {
      const { bpm, newStepData, newJoinData } = songFromStream(stream);
      if (newStepData && newJoinData) {
        setBpm(bpm);
        setStepData(newStepData);
        setJoinData(newJoinData);
        setNumSteps(newStepData.length);
        setPlaying(false);
      }
    }
  }, [params.stream]);

  // Play each step
  useEffect(() => {
    if (playing) {
      play(currentNotes, currentJoins);
    }
  }, [step]);

  function stopInterval() {
    if (playInterval) {
      clearInterval(playInterval);
    }
  }

  function restartInterval() {
    stopInterval();

    const delay = (60 / bpm) * 1000;
    playInterval = window.setInterval(() => {
      setStep(currentStep => (currentStep + 1) % numSteps);
    }, delay);
  }

  // Restart interval if song changes
  useEffect(() => {
    setStep(0);
    restartInterval();

    return () => {
      stopInterval();
    };
  }, [bpm, numSteps, playing]);

  return (
    <Template app="sequence">
      <div
        style={{
          alignItems: "center",
          margin: "20px 0",
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <Preview
          handlePlay={handleStart}
          handleStop={handleStop}
          isPlaying={playing}
          isWaiting={false}
          progress={step / (numSteps - 1)}
        />
        <label>
          BPM{" "}
          <input
            style={{ width: "4em" }}
            type="number"
            value={bpm}
            onChange={e => setBpm(Number(e.target.value) || 100)}
          />
        </label>
        <label>
          Num steps{" "}
          <input
            style={{ width: "4em" }}
            type="number"
            value={numSteps}
            onChange={e => {
              const newVal = Number(e.target.value) || 4;
              const newSteps = stepData.slice();
              const newJoinData = joinData.slice();
              while (newSteps.length < newVal) {
                newSteps.push([]);
                newJoinData.push([]);
              }
              while (newSteps.length > newVal) {
                newSteps.pop();
                newJoinData.pop();
              }
              setStepData(newSteps);
              setJoinData(newJoinData);
              setNumSteps(newVal);
            }}
          />
        </label>
        <button
          type="button"
          className="btn btn-primary med-btn"
          onClick={share}
        >
          <i className="fa fa-floppy-o" aria-hidden="true" /> <span>Share</span>
        </button>
        <button
          type="button"
          title="Start over"
          className="btn btn-danger med-btn"
          onClick={() => {
            reset();
            navigate(Paths.sequencePrefix("/"));
          }}
        >
          <i className="fa fa-trash" aria-label="Start over" />
        </button>
      </div>

      <Keyboard
        currentStepIndex={step}
        activeKeys={activeKeys}
        stepData={stepData}
        joinData={joinData}
        onStepsChange={(newStepData, newJoinData, changedStep) => {
          setStepData(newStepData);
          setJoinData(newJoinData);
          setNumSteps(newStepData.length);
          setPlaying(false);
          piano.stopAll();
          play(newStepData[changedStep], newJoinData[changedStep]);
        }}
      />

      {params.stream && (
        <section>
          <h3>This is not saved</h3>
          <p>
            This sequence exists only as a URL, so bookmark this page or copy it
            to clipboard: <Saver href={window.location.href} />
          </p>
        </section>
      )}
    </Template>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as Tone from "tone";
import Paths from "../Paths";
import Piano, { ActiveKeys } from "../Piano";
import Keyboard from "../ui/Keyboard";
import Sequencer from "../ui/Sequencer";
import Template from "./Template";
import Preview from "../ui/Preview";
import Saver from "../ui/Saver";
import { useSearchParams } from "react-router-dom";

function streamFromSong(
  bpm: number,
  bps: number,
  stepData: Array<number[]>,
  joinData: Array<number[]>
) {
  let out = `v4,${bpm},${bps},`;

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

function songFromStream(
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

const initial = {
  bpm: 60,
  bps: 2,
  numSteps: 8,
  stepData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => []),
  joinData: [1, 2, 3, 4, 5, 6, 7, 8].map(() => []),
};

export default function SequencePage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const offset = parseInt(searchParams.get("transpose") || "0");

  const piano = useMemo(() => new Piano(), []);

  const [playing, setPlaying] = useState(false);
  const [internalStep, setStep] = useState(0);
  const step = playing ? internalStep : -1;

  const [bpm, setBpm] = useState(initial.bpm);
  const [bpmInput, setBpmInput] = useState(String(bpm));

  const [bps, setBps] = useState(initial.bps);

  const [numSteps, setNumSteps] = useState(initial.numSteps);
  const [numStepsInput, setnumStepsInput] = useState(String(numSteps));

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
    // Hack to directly tie a keypress to sound generation so the WebAudio API
    // will allow sound on the page.
    const sine = new Tone.Oscillator(60, "sine").toDestination();
    sine.volume.value = -60;
    sine.start();
    sine.stop();

    setPlaying(true);
    setStep(0);
  }

  function handleStop() {
    piano.stopAll();
    setPlaying(false);
  }

  function reset() {
    setBpm(initial.bpm);
    setBps(initial.bps);
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
      Paths.sequencePrefix(
        `/songs/${streamFromSong(bpm, bps, stepData, joinData)}`
      )
    );
  }

  // Handle load
  useEffect(() => {
    const stream = params.stream;
    if (typeof stream === "string") {
      const { bpm, bps, newStepData, newJoinData } = songFromStream(
        stream,
        offset
      );
      if (newStepData && newJoinData) {
        setBpm(bpm);
        setBpmInput(String(bpm));
        setBps(bps);
        setStepData(newStepData);
        setJoinData(newJoinData);
        setNumSteps(newStepData.length);
        setnumStepsInput(String(newStepData.length));
        setPlaying(false);
      }
    }
  }, [params.stream, offset]);

  // Play each step
  useEffect(() => {
    if (playing) {
      play(currentNotes, currentJoins);

      const delay = (60 / bpm) * bps * 1000;
      window.setTimeout(() => {
        setStep(currentStep => (currentStep + 1) % numSteps);
      }, delay);
    }
  }, [step]);

  return (
    <Template title="Sequence" intro={null}>
      <div
        style={{
          alignItems: "center",
          margin: "20px 0",
          maxWidth: "750px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Preview
          handlePlay={handleStart}
          handleStop={handleStop}
          isPlaying={playing}
          isWaiting={false}
          progress={step / (numSteps - 1)}
        />
        <div>
          <label>
            BPM{" "}
            <input
              style={{ width: "4em" }}
              type="text"
              value={bpmInput}
              onFocus={e => e.target.select()}
              onChange={e => setBpmInput(e.target.value)}
              onBlur={e => {
                const num = parseInt(e.target.value);
                if (isNaN(num) || num < 1 || num > 400) {
                  // Invalid
                  setBpmInput(String(bpm));
                  return;
                }

                setBpm(num);
                setBpmInput(String(num));
              }}
            />
          </label>
          <div>
            <label>
              Beats/step{" "}
              <span style={{ display: "flex" }}>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={bps}
                  onChange={e => setBps(Number(e.target.value))}
                />
                <span style={{ marginLeft: "0.5em" }}>{bps}</span>
              </span>
            </label>
          </div>
        </div>

        <label>
          Num steps{" "}
          <input
            style={{ width: "4em" }}
            type="text"
            value={numStepsInput}
            onFocus={e => e.target.select()}
            onChange={e => setnumStepsInput(e.target.value)}
            onBlur={e => {
              const num = parseInt(e.target.value);
              if (isNaN(num) || num < 2) {
                // Invalid
                setnumStepsInput(String(numSteps));
                return;
              }

              const newSteps = stepData.slice();
              const newJoinData = joinData.slice();
              while (newSteps.length < num) {
                newSteps.push([]);
                newJoinData.push([]);
              }
              while (newSteps.length > num) {
                newSteps.pop();
                newJoinData.pop();
              }
              setStepData(newSteps);
              setJoinData(newJoinData);
              setNumSteps(num);
            }}
          />
        </label>
        <button
          type="button"
          className="btn btn-primary med-btn"
          onClick={share}
        >
          <i className="fa fa-floppy-o" aria-hidden="true" /> <span>Save</span>
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

      <Sequencer
        currentStepIndex={step}
        stepData={stepData}
        joinData={joinData}
        onStepsChange={(newStepData, newJoinData, changedStep) => {
          // console.log(JSON.stringify([newStepData, newJoinData]));

          setStepData(newStepData);
          setJoinData(newJoinData);
          setNumSteps(newStepData.length);
          setnumStepsInput(String(newStepData.length));
          setPlaying(false);
          piano.stopAll();
          play(newStepData[changedStep], newJoinData[changedStep]);
        }}
      />
      <Keyboard activeKeys={activeKeys} />

      {params.stream && (
        <section>
          <h3>Share it</h3>
          <p>
            Copy to clipboard: <Saver href={window.location.href} title="" />
          </p>
        </section>
      )}
    </Template>
  );
}

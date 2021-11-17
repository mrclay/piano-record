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
  joinNotes: boolean,
  sustain: boolean,
  steps: Array<number[]>
) {
  let out = `v2,${bpm},${joinNotes ? "1" : "0"},${sustain ? "1" : "0"},`;
  out += steps
    .map(chord =>
      chord
        .map(note => {
          let str = note.toString(16);
          return str.length < 2 ? "0" + str : str;
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
      data: m[3],
      joinNotes: false,
      sustain: m[2] === "1",
    };
  }

  m = stream.match(/^v2,(\d+),([10]),([10]),(.+)$/);
  if (m) {
    return {
      bpm: Number(m[1]),
      data: m[4],
      joinNotes: m[2] === "1",
      sustain: m[3] === "1",
    };
  }

  return {
    bpm: 0,
    data: null,
    joinNotes: false,
    sustain: false,
  };
}

function songFromStream(stream: string): {
  bpm: number;
  chords: Array<number[]> | false;
  joinNotes: boolean;
  sustain: boolean;
} {
  let { bpm, data, joinNotes, sustain } = parseStream(stream);

  if (!data) {
    return { bpm, chords: false, joinNotes, sustain };
  }

  const chords = data.split("-").map(str => {
    const notes: number[] = [];
    let chunk = "";
    while ((chunk = str.substr(notes.length * 2, 2))) {
      chunk = chunk.replace(/^0/, "");
      notes.push(parseInt(chunk, 16));
    }
    return notes;
  });

  return { bpm, chords, joinNotes, sustain };
}

export default function SequencePage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();

  const piano = useMemo(() => new Piano(), []);

  const [playing, setPlaying] = useState(true);
  const [internalStep, setStep] = useState(0);
  const step = playing ? internalStep : -1;

  const [bpm, setBpm] = useState(60);
  const [sustain, setSustain] = useState(true);
  const [joinNotes, setJoinNotes] = useState(true);
  const [numSteps, setNumSteps] = useState(8);
  const [stepData, setStepData] = useState<Array<number[]>>(() => {
    const out = [];
    while (out.length < numSteps) {
      out.push([]);
    }
    return out;
  });

  const chord = playing ? stepData[step] || [] : [];
  const activeKeys = chord.reduce(
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

  function play() {
    if (!playing) {
      return;
    }

    // Keep track of which are started
    const bannedNotes: ActiveKeys = {};
    // Handle notes already playing
    Object.entries(Piano.getActiveKeys())
      .filter(([k, v]) => v === true)
      .forEach(([noteStr]) => {
        const note = Number(noteStr);
        const willPlay = chord.includes(note);
        if (sustain) {
          // Stop and replay
          if (willPlay) {
            piano.stopNote(note);
            piano.startNote(note);
            bannedNotes[note] = true;
          }
        } else if (joinNotes) {
          if (!willPlay) {
            piano.stopNote(note);
          } else {
            // Marking so we don't restart it
            bannedNotes[note] = true;
          }
        } else {
          piano.stopNote(note);
          if (willPlay) {
            piano.startNote(note);
            bannedNotes[note] = true;
          }
        }
      });

    // Start notes that still need starting
    stepData[step].forEach(note => {
      if (!bannedNotes[note]) {
        piano.startNote(note);
      }
    });
  }

  function share() {
    navigate(
      Paths.sequencePrefix(
        `/songs/${streamFromSong(bpm, joinNotes, sustain, stepData)}`
      )
    );
  }

  // Handle load
  useEffect(() => {
    const stream = params.stream;
    if (typeof stream === "string") {
      const { bpm, chords, joinNotes, sustain } = songFromStream(stream);
      if (chords) {
        setBpm(bpm);
        setJoinNotes(joinNotes);
        setSustain(sustain);
        setStepData(chords);
        setNumSteps(chords.length);
        setPlaying(false);
      }
    }
  }, [params.stream]);

  // Play each step
  useEffect(() => {
    play();
  }, [step]);

  // Restart interval if song changes
  useEffect(() => {
    setStep(0);
    const delay = (60 / bpm) * 1000;
    const interval = window.setInterval(() => {
      setStep(currentStep => (currentStep + 1) % numSteps);
    }, delay);

    return () => {
      clearInterval(interval);
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
              while (newSteps.length < newVal) {
                newSteps.push([]);
              }
              while (newSteps.length > newVal) {
                newSteps.pop();
              }
              setStepData(newSteps);
              setNumSteps(newVal);
            }}
          />
        </label>
        <div>
          <label>
            <input
              type="checkbox"
              checked={sustain}
              onChange={e => setSustain(e.target.checked)}
            />{" "}
            Sustain pedal
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={joinNotes}
              onChange={e => setJoinNotes(e.target.checked)}
            />{" "}
            Join notes
          </label>
        </div>
        <button
          type="button"
          className="btn btn-primary med-btn"
          onClick={share}
        >
          <i className="fa fa-floppy-o" aria-hidden="true" /> <span>Share</span>
        </button>
      </div>

      <Keyboard
        currentStepIndex={step}
        activeKeys={activeKeys}
        steps={stepData}
        onStepsChange={(steps: Array<number[]>, changedChord: number[]) => {
          setStepData(steps);
          setNumSteps(steps.length);
          setStep(0);
          piano.stopAll();
          changedChord.forEach(note => piano.startNote(note));
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

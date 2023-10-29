import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import * as Tone from "tone";

import Paths from "../Paths";
import { ActiveKeys } from "../Piano";
import Keyboard from "../ui/Keyboard";
import Sequencer from "../ui/Sequencer";
import Preview from "../ui/Preview";
import Saver from "../ui/Saver";
import PianoShepardMode from "../ui/PianoShepardMode";
import { useStore } from "../store";
import SoundSelector, { useSfStorage } from "../ui/SoundSelector";
import { Content900, H1, HeadingNav, HrFinal } from "../ui/Common";

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

let stepTimeout = 0;

export default function SequencePage(): JSX.Element {
  const { saveSf } = useSfStorage();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const offset = parseInt(searchParams.get("transpose") || "0");

  const [piano] = useStore.piano();

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
  const activeKeys: ActiveKeys = new Set(currentNotes);

  function handleStart() {
    // Hack to directly tie a keypress to sound generation so the WebAudio API
    // will allow sound on the page.
    const sine = new Tone.Oscillator(60, "sine").toDestination();
    sine.volume.value = -60;
    sine.start();
    sine.stop();

    setPlaying(true);
  }

  function handleStop() {
    piano.stopAll();
    setPlaying(false);
    setStep(0);
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

  const play = useCallback(
    (currentNotes: number[], currentJoins: number[]) => {
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
    },
    [piano]
  );

  function share() {
    const params = saveSf();
    navigate(
      Paths.sequencePrefix(
        `/songs/${streamFromSong(bpm, bps, stepData, joinData)}?${params}`
      )
    );
  }

  // Handle load
  useEffect(() => {
    document.title = "Sequence";

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
      stepTimeout = window.setTimeout(() => {
        setStep(currentStep => (currentStep + 1) % numSteps);
      }, delay);
    }
  }, [step]);

  useEffect(() => {
    if (!playing && stepTimeout) {
      window.clearTimeout(stepTimeout);
      stepTimeout = 0;
    }
  }, [playing]);

  return (
    <>
      <HeadingNav />

      <Content900>
        <div className="d-flex justify-content-between">
          <H1>Sequence</H1>

          <button
            type="button"
            className="btn btn-lg btn-link text-danger text-decoration-none"
            onClick={() => {
              reset();
              navigate(Paths.sequencePrefix("/"));
            }}
          >
            <i className="fa fa-trash" aria-label="Start over" /> New
          </button>
        </div>

        <p>
          Some examples:{" "}
          <a href="/sequence/songs/v4,80,2,p2fp3ep47p52-j2fj52p3cp45-p2fp52p3bp43-j2fj52p3cp42-p2fp52p41p3d-j2fj52p42p3e-p2fp52p36p34-j2fj52j36p32?sf=Mellotron.mk2_flute">
            70's horror
          </a>
          ,{" "}
          <a href="/sequence/songs/v4,50,1,p3ep40p43p47p28-p34j3ej40j43j47-p46p3ap3cp41p32-p45j3aj3cj41p26-p39p3ap3fp45p24-p30j39j3aj3fp43-p2fp36p37p39p3e-j2fj36j37j39j3e-p2ep35p3ap3ep39-j2ej3aj35p3fj39-p2dp37p3bp3cp40-j2dj37j3bj3cp41-p2cp3cp43p35p38p3f-j2cj3cp41j35j38j3f-p2bp35p39p3cp3e-j2bj35j39j3cj3e?sf=MusyngKite.synth_brass_1">
            Sad synths
          </a>
          ,{" "}
          <a href="/sequence/songs/v4,170,1,p26p3dp39p36-j26j3d-p2dj3d-p32p36p40-p26j36j40-j36j40p28-p39p3ep2bp34-j3ej39j2bj34p2d">
            Piano groove
          </a>
          .
        </p>
      </Content900>

      <Content900>
        <div className="d-flex align-items-center">
          <Preview
            handlePlay={handleStart}
            handleStop={handleStop}
            isPlaying={playing}
            isWaiting={false}
            progress={{
              ratio: step / (numSteps - 1),
              steps: [step, numSteps],
            }}
          />

          <button
            type="button"
            className="btn btn-primary med-btn text-nowrap mx-3"
            onClick={share}
          >
            <i className="fa fa-floppy-o" aria-hidden="true" />{" "}
            <span>Save</span>
          </button>

          <div>
            <div>
              <label className="me-3">
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

              <label>
                Steps{" "}
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
            </div>

            <div className="mt-2 text-center">
              <label>
                Beats/step{" "}
                <span className="d-flex">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={bps}
                    onChange={e => setBps(Number(e.target.value))}
                  />
                  <span className="ms-1">{bps}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </Content900>

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
          setStep(changedStep);
          play(newStepData[changedStep], newJoinData[changedStep]);
        }}
      />
      <Keyboard activeKeys={activeKeys} />

      <Content900>
        <SoundSelector />
        <PianoShepardMode piano={piano} />
      </Content900>

      <Content900>
        {params.stream && (
          <section>
            <h3>Share it</h3>
            <p>
              Copy to clipboard: <Saver href={window.location.href} title="" />
            </p>
          </section>
        )}
      </Content900>

      <HrFinal />
    </>
  );
}

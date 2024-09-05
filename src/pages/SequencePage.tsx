import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import * as Tone from "tone";

import Paths from "../Paths";
import Keyboard from "../ui/Keyboard";
import Sequencer from "../ui/Sequencer";
import Preview from "../ui/Preview";
import Saver from "../ui/Saver";
import PianoShepardMode from "../ui/PianoShepardMode";
import { useStore } from "../store";
import SoundSelector, { useSfStorage } from "../ui/SoundSelector";
import { Content900, H1, HeadingNav, HrFinal } from "../ui/Common";
import {
  initialSequenceConfig,
  playSequence,
  sequenceFromStream,
} from "../Sequencer";

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

const initial = initialSequenceConfig;

export default function SequencePage(): JSX.Element {
  const { saveSf } = useSfStorage();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const offset = parseInt(searchParams.get("transpose") || "0");

  const [piano] = useStore.piano();

  const [sequencer, setSequencer] = useState<ReturnType<
    typeof playSequence
  > | null>(null);
  const playing = Boolean(sequencer);

  const [internalStep, setStep] = useState(0);
  const step = playing ? internalStep : -1;

  const [bpm, setBpm] = useState(initial.bpm);
  const [bpmInput, setBpmInput] = useState(String(bpm));

  const [bps, setBps] = useState(initial.bps);

  const [stepData, setStepData] = useState<Array<number[]>>(initial.stepData);
  const [joinData, setJoinData] = useState<Array<number[]>>(initial.joinData);

  const [numSteps, setNumSteps] = useState(initial.stepData.length);
  const [numStepsInput, setnumStepsInput] = useState(String(numSteps));

  const activeKeys = sequencer?.getActiveKeys() || new Set();

  async function handleStart() {
    await Tone.start();
    const sequencer = playSequence({
      bpm,
      bps,
      step: internalStep,
      stepData,
      joinData,
      piano,
    });
    sequencer.eventTarget.addEventListener("step", e => {
      setStep(e.step);
    });
    sequencer.eventTarget.addEventListener("stop", () => setStep(-1));
    sequencer.start();
    setSequencer(sequencer);
  }

  function handleStop() {
    piano.stopAll();
    sequencer?.stop();
    setSequencer(null);
  }

  function reset() {
    piano.stopAll();
    setBpm(initial.bpm);
    setBps(initial.bps);
    setNumSteps(initial.stepData.length);
    setStepData(initial.stepData);
    setJoinData(initial.joinData);
    setStep(internalStep % initial.stepData.length);
    setSequencer(null);
  }

  function play(currentNotes: number[]) {
    currentNotes.forEach(note => {
      piano.startNote(note);
    });
  }

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
      const { bpm, bps, newStepData, newJoinData } = sequenceFromStream(
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
        setSequencer(null);
      }
    }
  }, [params.stream, offset]);

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
                    sequencer?.setBpm(num);
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
                    onChange={e => {
                      setBps(Number(e.target.value));
                      sequencer?.setBps(Number(e.target.value));
                    }}
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
          handleStop();
          setStep(changedStep);
          play(newStepData[changedStep]);
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

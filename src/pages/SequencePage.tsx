import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import Head from "@uiw/react-head";

import Paths from "../Paths";
import Keyboard from "../ui/Keyboard";
import SequencerUi from "../ui/Sequencer";
import Preview from "../ui/Preview";
import Saver from "../ui/Saver";
import { useStore } from "../store";
import SoundSelector, { useSfStorage } from "../ui/SoundSelector";
import { Content900, H1, HeadingNav, HrFinal } from "../ui/Common";
import { sequenceFromStream, SequencerEvents } from "../Sequencer";
import Transpose from "../ui/Transpose";

let resetDuringNextEffect = true;

function streamFromSong(
  bpm: number,
  bps: number,
  stepData: Array<number[]>,
  joinData: Array<number[]>,
) {
  let out = `v4,${bpm},${String(bps).replace(".", "p")},`;

  out += stepData
    .map(
      (stepNotes, stepIdx) =>
        stepNotes
          .map(note => {
            const str = note.toString(16);
            const j = joinData[stepIdx].includes(note) ? "j" : "p";
            return j + (str.length < 2 ? "0" + str : str);
          })
          .join("") || ".",
    )
    .join("-");
  return out;
}

const bpsOptions = [
  { value: "0.25", label: "1/16" },
  { value: "0.5", label: "1/8" },
  { value: "1", label: "1/4" },
  { value: "2", label: "1/2" },
  { value: "3", label: "dotted 1/2" },
  { value: "4", label: "whole" },
];

export default function SequencePage(): JSX.Element {
  const { saveSf } = useSfStorage();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const offset = parseInt(searchParams.get("transpose") || "0");

  const [piano] = useStore.piano();
  const [sequencer] = useStore.sequencer();

  const [, setRenderNum] = useState(0);
  const forceRender = () => setRenderNum(prev => prev + 1);

  const step = sequencer.isPlaying() ? sequencer.getStep() : -1;
  const numSteps = sequencer.getNumSteps();

  const [internalStep, setStep] = useState(0);
  const [bpmInput, setBpmInput] = useState(String(sequencer.bpm));
  const [numStepsInput, setNumStepsInput] = useState(
    String(sequencer.getNumSteps()),
  );

  useEffect(() => {
    function stepHandler({ step }: SequencerEvents["step"]) {
      setStep(step);
      forceRender();
    }

    sequencer.addEventListener("step", stepHandler);

    return () => sequencer.removeEventListener("step", stepHandler);
  }, [sequencer]);

  async function handleStart() {
    sequencer.start(internalStep);
  }

  function handleStop() {
    piano.stopAll();
    sequencer.stop();
    setStep(0);
    forceRender();
  }

  function reset() {
    handleStop();
    sequencer.reset();
    setBpmInput(String(sequencer.bpm));
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
        `/songs/${streamFromSong(
          sequencer.bpm,
          sequencer.bps,
          sequencer.stepData,
          sequencer.joinData,
        )}?${params}`,
      ),
    );
  }

  // Handle load
  useEffect(() => {
    if (resetDuringNextEffect) {
      sequencer.reset();
    }

    const stream = params.stream;
    if (typeof stream === "string") {
      const { bpm, bps, newStepData, newJoinData } = sequenceFromStream(
        stream,
        offset,
      );
      if (newStepData && newJoinData) {
        Object.assign(sequencer, {
          bpm,
          bps,
          stepData: newStepData,
          joinData: newJoinData,
        });
        setBpmInput(String(sequencer.bpm));
        setNumStepsInput(String(newStepData.length));
      }
    }

    forceRender();
  }, [params.stream, offset]);

  return (
    <>
      <HeadingNav />

      <Content900>
        <div className="d-flex justify-content-between">
          <H1>Sequence</H1>
          <Head>
            <Head.Title>Sequence : mrclay.org</Head.Title>
          </Head>

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
          <a href="/sequence/songs/v4,50,1,p3ep40p43p47p28-p34j3ej40j43j47-p46p3ap3cp41p32-p45j3aj3cj41p26-p39p3ap3fp45p24-p30j39j3aj3fp43-p2fp36p37p39p3e-j36j37j39j3ep23-p35p3ap3ep39p22-p2ej3aj35p3fj39-p2dp37p3bp3cp40-j37j3bj3cp41p21-p3cp43p35p38p3fp20-p2cj3cp41j35j38j3f-p2bp35p39p3cp3e-j2bj35j39j3cj3e?sf=MusyngKite.synth_brass_1">
            Sad synths
          </a>
          ,{" "}
          <a href="/sequence/songs/v4,90,0p5,p26p3dp39p36-j26j3d-p2dj3d-p32p36p40-p26j36j40-j36j40p28-p39p3ep2bp34-j3ej39j2bj34p2d">
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
            isPlaying={sequencer.isPlaying()}
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
                    if (!isNaN(num) && num >= 1 && num <= 400) {
                      sequencer.bpm = num;
                    }
                    setBpmInput(String(sequencer.bpm));
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
                  onChange={e => setNumStepsInput(e.target.value)}
                  onBlur={e => {
                    const num = parseInt(e.target.value);
                    if (!isNaN(num) && num >= 2) {
                      sequencer.setNumSteps(num);
                    }

                    setNumStepsInput(String(sequencer.getNumSteps()));
                    forceRender();
                  }}
                />
              </label>
            </div>

            <div className="mt-2 text-center">
              <label>
                Step length{" "}
                <select
                  style={{ padding: "3px 0" }}
                  value={
                    bpsOptions.find(el => el.value === String(sequencer.bps))
                      ?.value
                  }
                  onChange={e => {
                    sequencer.bps = Number(e.target.value);
                    forceRender();
                  }}
                >
                  {bpsOptions.map(({ value, label }) => (
                    <option value={value} key={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="ms-3">
            <Transpose
              onChange={semitones => {
                sequencer.stepData = sequencer.stepData.map(step =>
                  step.map(note => note + semitones),
                );
                sequencer.joinData = sequencer.joinData.map(step =>
                  step.map(note => note + semitones),
                );

                // Don't reset the sequencer during the next few effects
                resetDuringNextEffect = false;
                setTimeout(() => {
                  resetDuringNextEffect = true;
                }, 500);
                share();
              }}
            />
          </div>
        </div>
      </Content900>

      <SequencerUi
        currentStepIndex={step}
        stepData={sequencer.stepData}
        joinData={sequencer.joinData}
        onStepsChange={(newStepData, newJoinData, changedStep) => {
          // console.log(JSON.stringify([newStepData, newJoinData]));

          sequencer.stepData = newStepData;
          sequencer.joinData = newJoinData;
          setNumStepsInput(String(sequencer.getNumSteps()));

          if (!sequencer.isPlaying()) {
            handleStop();
            setStep(changedStep);
            play(newStepData[changedStep]);
          }
        }}
      />
      <Keyboard piano={sequencer.piano} />

      <Content900>
        <SoundSelector />
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

      <Content900></Content900>

      <HrFinal />
    </>
  );
}

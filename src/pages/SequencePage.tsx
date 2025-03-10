import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import Head from "@uiw/react-head";

import Paths from "../Paths";
import Keyboard from "../ui/Keyboard";
import SequencerUI from "../ui/SequencerUI";
import Preview from "../ui/Preview";
import Saver from "../ui/Saver";
import { useStore } from "../store";
import SoundSelector, { useSfStorage } from "../ui/SoundSelector";
import { Content900, H1, HeadingNav, HrFinal } from "../ui/Common";
import { sequenceFromStream, streamFromSong } from "../Sequencer";
import Transpose from "../ui/Transpose";

let resetDuringNextEffect = true;

const bpsOptions = [
  { value: "0.25", label: "1/16" },
  { value: "0.5", label: "1/8" },
  { value: "1", label: "1/4" },
  { value: "2", label: "1/2" },
  { value: "3", label: "3/4" },
  { value: "4", label: "whole" },
];

const rhythmOptions = [
  { value: "1-1", label: "None" },
  { value: "2-1", label: "Heavy" },
  { value: "7-4", label: "Medium" },
  { value: "3-2", label: "Light" },
];

export default function SequencePage(): ReactNode {
  const { saveSf } = useSfStorage();
  const stopAllTimeoutRef = useRef(0);
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const offset = parseInt(searchParams.get("transpose") || "0");

  const [piano] = useStore.piano();
  const [playerSpec] = useStore.playerSpec();
  const [sequencer] = useStore.sequencer();
  const groups = sequencer.getGroups();
  const groupFirstSteps = useMemo(() => {
    const map = new Map<number, number>();
    let step = 0;
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      map.set(i, step);
      step += g.length;
    }
    return map;
  }, [groups]);
  const activeGroupIdx = sequencer.isPlaying()
    ? sequencer.getActiveGroupIdx()
    : 0;

  const [, setRenderNum] = useState(0);
  const forceRender = () => setRenderNum(prev => prev + 1);

  const step = sequencer.getDataIdx();
  const numSteps = sequencer.getNumSteps();

  const [bpmInput, setBpmInput] = useState(String(sequencer.bpm));
  const [numStepsInput, setNumStepsInput] = useState(
    String(sequencer.getNumSteps()),
  );

  const [editingText, setEditingText] = useState(false);
  const [editValue, setEditValue] = useState("");

  const fixedObserverRef = useRef<HTMLDivElement | null>(null);
  const [fixedControls, setFixedControls] = useState(false);

  useEffect(() => {
    const fixedObserver = fixedObserverRef.current;
    if (fixedObserver) {
      fixedObserver.style.minHeight =
        fixedObserver.getBoundingClientRect().height + "px";
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.boundingClientRect.top <= 0) {
          setFixedControls(true);
        } else {
          setFixedControls(false);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "0px",
      threshold: 1,
    });

    if (fixedObserverRef.current) {
      observer.observe(fixedObserverRef.current!);
    }

    return () => {
      if (fixedObserverRef.current) {
        observer.unobserve(fixedObserverRef.current!);
      }
    };
  }, []);

  useEffect(() => {
    sequencer.addEventListener("step", forceRender);

    return () => sequencer.removeEventListener("step", forceRender);
  }, [sequencer]);

  async function handleStart() {
    sequencer.start();
  }

  function handleRewindPlay() {
    sequencer.setStep(0);
    sequencer.start();
  }

  function handleStop() {
    piano.stopAll();
    sequencer.stop();
    forceRender();
  }

  function handleStepInc(inc: number) {
    sequencer.setStep(sequencer.getStep() + inc);
    forceRender();
  }

  function reset() {
    handleStop();
    sequencer.reset();
    setBpmInput(String(sequencer.bpm));
  }

  function sampleStep(currentNotes: number[]) {
    window.clearTimeout(stopAllTimeoutRef.current);
    piano.stopAll();
    currentNotes.forEach(note => {
      piano.startNote(note);
    });

    stopAllTimeoutRef.current = window.setTimeout(() => {
      piano.stopAll();
    }, 1000);
  }

  function share() {
    const params = saveSf();
    navigate(
      Paths.sequencePrefix(
        `/songs/${streamFromSong(
          sequencer.bpm,
          sequencer.bps,
          sequencer.rhythm,
          sequencer.stepData,
          sequencer.joinData,
          sequencer.getGroups(),
        )}?${params}`,
      ),
    );
  }

  // Handle load
  useEffect(() => {
    if (resetDuringNextEffect) {
      sequencer.reset();
    }

    const stream = params["stream"];
    if (typeof stream === "string") {
      const { bpm, bps, rhythm, newStepData, newJoinData, groups } =
        sequenceFromStream(stream, offset);
      if (newStepData && newJoinData) {
        Object.assign(sequencer, {
          bpm,
          bps,
          rhythm,
          stepData: newStepData,
          joinData: newJoinData,
        });
        sequencer.setGroups(groups);
        setBpmInput(String(sequencer.bpm));
        setNumStepsInput(String(newStepData.length));
      }
    }

    forceRender();
  }, [params["stream"], offset]);

  return (
    <>
      <HeadingNav />

      <Content900 className="sequence-header">
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

        {examples}
      </Content900>

      <div ref={fixedObserverRef}>
        <div
          className="sequence-controls"
          data-fixed={fixedControls ? "" : undefined}
        >
          <div className="d-flex align-items-end" style={{ gap: "15px" }}>
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-info med-btn text-nowrap"
                onClick={handleRewindPlay}
                title="Play from beginning"
              >
                <i className="fa fa-fast-backward" aria-hidden="true" />
              </button>

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
            </div>

            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-outline-info med-btn text-nowrap"
                onClick={() => handleStepInc(-1)}
              >
                <i className="fa fa-step-backward" aria-hidden="true" />
              </button>

              <button
                type="button"
                className="btn btn-outline-info med-btn text-nowrap"
                onClick={() => handleStepInc(1)}
              >
                <i className="fa fa-step-forward" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary med-btn text-nowrap"
              onClick={share}
            >
              <i className="fa fa-floppy-o" aria-hidden="true" />{" "}
              <span>Save</span>
            </button>

            <div className="d-flex flex-column" style={{ gap: "10px" }}>
              <div>
                <label className="text-nowrap">
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
              </div>
              <div>
                <label className="text-nowrap">
                  Steps{" "}
                  <input
                    style={{ width: "3.5em" }}
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
                  />{" "}
                  &times;{" "}
                  <select
                    style={{ padding: "3px 0", width: "4rem" }}
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

            <div className="d-flex flex-column" style={{ gap: "10px" }}>
              <div className="text-end">
                <label className="text-nowrap">
                  Swing{" "}
                  <select
                    style={{ padding: "3px 0", width: "5rem" }}
                    value={
                      rhythmOptions.find(
                        el => el.value === sequencer.rhythm.join("-"),
                      )?.value
                    }
                    onChange={e => {
                      sequencer.rhythm = e.target.value.split("-").map(Number);
                      forceRender();
                    }}
                  >
                    {rhythmOptions.map(({ value, label }) => (
                      <option value={value} key={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="text-end">
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
          </div>
        </div>
      </div>

      <SequencerUI
        currentStepIndex={step}
        sequencer={sequencer}
        onStepsChange={changedSteps => {
          // console.log(JSON.stringify([newStepData, newJoinData]));

          setNumStepsInput(String(sequencer.getNumSteps()));
          if (!sequencer.isPlaying()) {
            handleStop();
            sequencer.setStep(changedSteps[0]!);
            sampleStep(sequencer.stepData[changedSteps[0]!]!);
          }
          forceRender();
        }}
      />
      <Keyboard piano={sequencer.piano} />

      <Content900>
        <div>Song Sections</div>
        {groups.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className={`sequencer-section color-${group.colorIdx % 7}`}
            data-active={groupIdx === activeGroupIdx ? "" : undefined}
          >
            <button
              className="group-action-button"
              type="button"
              onClick={() => {
                groups.splice(groupIdx, 0, { ...groups[groupIdx] });
                sequencer.setGroups(groups);
                forceRender();
              }}
              title="Copy section"
            >
              c
            </button>
            <button
              className="group-action-button"
              type="button"
              onClick={() => {
                const tmp = groups[groupIdx + 1];
                groups[groupIdx + 1] = groups[groupIdx];
                groups[groupIdx] = tmp;
                sequencer.setGroups(groups);
                forceRender();
              }}
              disabled={groupIdx === groups.length - 1}
              title="Move later"
            >
              &darr;
            </button>
            <button
              className="group-action-button"
              type="button"
              onClick={() => {
                const tmp = groups[groupIdx - 1];
                groups[groupIdx - 1] = groups[groupIdx];
                groups[groupIdx] = tmp;
                sequencer.setGroups(groups);
                forceRender();
              }}
              disabled={groupIdx === 0}
              title="Move earlier"
            >
              &uarr;
            </button>
            <label>
              Start{" "}
              <input
                type="text"
                value={group.start}
                onChange={e => {
                  const num = parseInt(
                    e.target.value.replace(/\D+/g, "") || "0",
                  );
                  sequencer.setGroups(
                    groups.map(el => {
                      if (el === group) {
                        el.start = num;
                      }
                      return { ...el };
                    }),
                  );
                  forceRender();
                }}
              />
            </label>
            <label>
              Length{" "}
              <input
                type="text"
                value={group.length}
                onChange={e => {
                  const num = parseInt(
                    e.target.value.replace(/\D+/g, "") || "0",
                  );
                  sequencer.setGroups(
                    groups.map(el => {
                      if (el === group) {
                        el.length = num;
                      }
                      return { ...el };
                    }),
                  );
                  forceRender();
                }}
              />
            </label>
            <button
              className="group-action-button"
              type="button"
              onClick={() => {
                sequencer.setGroups(
                  groups.filter(el => el !== group).map(el => ({ ...el })),
                );
                forceRender();
              }}
              disabled={sequencer.getGroups().length === 1}
              title="Remove section"
            >
              &times;
            </button>
            <button
              type="button"
              onClick={() => {
                const firstStep = groupFirstSteps.get(groupIdx);
                if (typeof firstStep === "number") {
                  sequencer.stop();
                  sequencer.setStep(firstStep);
                  sequencer.start();
                }
              }}
            >
              Play
            </button>
            <span>{groupIdx === activeGroupIdx ? "◀" : ""}</span>
          </div>
        ))}
      </Content900>

      <Content900>
        <SoundSelector />
      </Content900>

      <Content900>
        {params["stream"] && (
          <section>
            <h3>Share it</h3>
            <p>
              Copy to clipboard:{" "}
              <Saver
                href={window.location.href}
                title=""
                getMidi={() =>
                  sequencer.toMidi({
                    program: playerSpec.midiProgram,
                  })
                }
              />
            </p>
          </section>
        )}
      </Content900>

      <div className="mb-5">
        {editingText && (
          <textarea
            rows={editValue.split("\n").length}
            style={{
              width: "100%",
              fontSize: "10px",
              fontFamily: "monospace",
            }}
            value={editValue}
            onChange={e => setEditValue(e.currentTarget.value)}
          />
        )}
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (editingText) {
              sequencer.setStepsFromText(editValue);
              share();
            } else {
              setEditValue(sequencer.toTextLines().join("\n"));
            }
            setEditingText(prev => !prev);
          }}
        >
          {editingText ? "Save" : "Edit as text"}
        </button>
      </div>

      {examplesMore}

      <HrFinal />
    </>
  );
}

const examples = (
  <p className="text-nowrap mb-0">
    Some examples:{" "}
    <a href="/sequence/songs/v4,196,1,p3fp2fp3bp3a-j3fj3bj3a-p2aj3f-p2ep3fp3ap38-j2ej3fj3aj38-j3fj2ej3aj38-j3fp29j3aj38-j3fp2ej3aj38-p46p33p3cp3ap3fp37-j46j3cj3aj3fj37-p27j46-p2cp37p3ap3cp3fj46-j2cj37j3aj3cj3fj46-j2cj37j3aj3cj3fj46-j37p25j3aj3cj3fj46-j37p29j3aj3cj3fj46-p42p3dp38p2a-j42j3dj38j2a-p25j42-p3fp3ap3bp36p28-j3fj3aj3bj36j28-j3fj3bj3aj36j28-j3fj3bj3aj36p2c-j3fj3bj3aj36p2e?sf=MusyngKite.electric_piano_1">
      Electric Relaxation
    </a>
    {", "}
    <a href="/sequence/songs/v4,80,2,p2fp3ep47p52-j2fj52p3cp45-p2fp52p3bp43-j2fj52p3cp42-p2fp52p41p3d-j2fj52p42p3e-p2fp52p36p34-j2fj52j36p32?sf=Mellotron.mk2_flute">
      70's horror
    </a>
    {", "}
    <a href="/sequence/songs/v4,50,1,p3ep40p43p47p28-p34j3ej40j43j47-p46p3ap3cp41p32-p45j3aj3cj41p26-p39p3ap3fp45p24-p30j39j3aj3fp43-p2fp36p37p39p3e-j36j37j39j3ep23-p35p3ap3ep39p22-p2ej3aj35p3fj39-p2dp37p3bp3cp40-j37j3bj3cp41p21-p3cp43p35p38p3fp20-p2cj3cp41j35j38j3f-p2bp35p39p3cp3e-j2bj35j39j3cj3e?sf=MusyngKite.synth_brass_1">
      Sad synths
    </a>
    {", "}
    <a href="/sequence/songs/v4,80,1,p45p3ep2dp36-p47j2dj36j3e-p45j36p2dj3e-p42p32p36p39-j32j36j42p3b-p3dj32j36j42-p2dp45p3ep36-j2dj3ej36p47-p45j36j3ep2d-p42p36p26p39-j42j36p45j26-j42j36p3ej26-p4cp28p3dp37-j4cj28p39j3d-p4cj28p3bp40-p49p2dp3dp40-j49j2dp39p43-j49j2dp34p40-p4ap2dp36p40-j4aj2dj36p45-p4aj2dp39j36-p45p26p42p32-j45j26j42p36-j45j26j42p3c-p3bp47p32p1f-j47j32j3bp23-p47j32j3bp26-p4ap2bp3ep3b-p49j2bj3ep32-p47j2bj3ep34-p45p26p36p39-j26j36j39p47-p45j26j39j36-p42p26p39p32-j42j26j39j32-j42p3cp32p2d-p47p3bp32p2b-j47j3bj32p2f-p47j3bj32p26-p4ap2bp3b-p49j2bp32p39-p47j2bp34p37-p45p2dp36p39-p47j2dj36j39-p45j2dp39j36-p42p36p39p3bp2f-j42j39j36p3dp31-j42j39j36p3ep32-p4cp45p43p3ep34-j4cj45j43j3ep39-p4cj45j43p3e-p4fp45p43p3dp39-p4cj45j43j3dp3b-p49j45j43p40p39-p4ap42p45j39-j4aj42j45p3e-j4aj42j45p39-p4ep42p45-j4ej42j45-j4ej42j45-p4ap32p36p26-p45p28j32p39-p42p2ap38j32-p2dp31p37p45-p43j2dj31j37-p40j31j37p2d-p3ep36p32p26-j3ej36j32j26-j3ej36j32j26-.-.-.?sf=FluidR3_GM.violin">
      Silent Night
    </a>
    {", "}
    <a href="/sequence/songs/v4,80,2,p40p30p3bp43p3e-p33p3ep43p3ap41-p31p38p3cp43p41-p34p38p3ep43-p43p38p3ep2ep40-p38p43p30p3ap3f-p3ap41p43p32p37-p2bp43p40p35p39p3c">
      G on top
    </a>
  </p>
);
const examplesMore = (
  <p>
    More examples:{" "}
    <a href="/sequence/songs/v4,75,0p5,p26p3dp39p36-j26j3d-p2dj3d-p32p36p40-p26j36j40-j36j40p28-p39p3ep2bp34-j3ej39j2bj34p2d-p26p3dp39p36-j26j3d-p2dj3d-p32p36p40-j36j40p26-j36j40p28-p39p3ep2bp34-j3ej39j2bj34p2d-p3dp2fp3bp37-p3ej37j3bj2f-j3ej3bp32j37-p3bp37p2bj32-j3bp2dj37j32-j3bp2fj37j32-j3bp32j37j2f-j32p37p41j2f-p2ep35p39p40-j2ej35j39j40-p32j35p3aj39p41-p35j3aj39j32p3ep29-j3aj35p2ej32j3e-p3aj35j2ep30j32j3e-j3aj35j2ep32j3e-j3ap35j2ej3e">
      Piano groove
    </a>
    {", "}
    <a href="/sequence/songs/v4,110,0p5,p30p37p40p3c-p30j37j40j3c-p3ej37j40p2bj3c-j3ej37j40p2bj3c-p2ep35p39j3e-p2ej35j39j3e-p3aj35j39p29j3e-j35j3aj39p29j3e-p35p41p2dp39j3e-j35j41p2dj39j3e-p3ej35j41p2bj39-j3ej35j41p2bj39-p39p36p26-p3cj36j39p26-j3cj36j39p26-j3cj36p39p26">
      Lilys
    </a>
    {", "}
    <a href="/sequence/songs/v4,45,1,p36p47p40p39-j36j47p3dj40-p2fp3cp45p41-j2fj45p42j3c-p34p47p44p3f-j34p38p44p3b-p31p3dp40p38-j31j3dj40j38-p47p40p45p2a-j47p40p3dj2a-p3cp45p41p2f-j45p42j3cj2f-p3fp44p38p34-p38p49p3dp28-p40p4bp3cp25-j40p4cp3bj25?sf=FluidR3_GM.cello">
      Sad quartet
    </a>
    {", "}
    <a href="/sequence/songs/v4,60,1,p43p47p4cp24-j43j47j4cj24-p48p4cp51p29p45-j48j4cp4fj29j45-p41p45p4ap2e-j41j45j4aj2e-p46p4ap4fp33p43-j46j4ap4dj33j43-p38p43p48p3f-j38p48j43j3f-p3dp44p48p4dp41-j3dj44j48p4bj41-p45p4ap3ep41p48-j45j4aj41j48j3e-p47p4cp41p45p2b-j47j41j45j2bp4a">
      4ths pattern
    </a>
    {", "}
    <a href="/sequence/songs/v4,70,1,p28p3fp38p3b-j28p44j3fj38j3b-j28p49j3fj38j3bj44-j28p46j3fj38j3bj44j49-p27p3aj46p43p3e-j27p3aj46j43j3e-j27j3aj46j43j3ep3c-j27j3aj43j3ej3c-p3fp46p31p40-p47j31j40p3dj3f-j31p40j3fj3dj47p3b-p44j31j40p3aj3d-p3bp47p2fp37p42p3e-j3bj47j2fj37j42j3e-j47j3bj2fj37j42j3e-j3bj2fj37j42j47j3e">
      Shoegaze progression
    </a>
  </p>
);

import React, {
  DragEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";

import "./index.scss";
import { getPianoKeyLayout } from "../Keyboard";

interface SequencerProps {
  currentStepIndex: number;
  onStepsChange(
    stepData: Array<number[]>,
    joinData: Array<number[]>,
    changedSteps: number[],
  ): void;
  stepData: Array<number[]>;
  joinData: Array<number[]>;
}

const { whites, blacks } = getPianoKeyLayout();

interface StepNote {
  step: number;
  note: number;
}

function stepNoteFromId(id: string): StepNote {
  const [step = 0, note = 0] = id.substring(2).split("-").map(Number);
  return { step, note };
}

export default function SequencerUI({
  currentStepIndex,
  onStepsChange,
  stepData,
  joinData,
}: SequencerProps) {
  const [fromNote, setFromNote] = useState<StepNote | null>(null);

  const onDragStart: DragEventHandler = e => {
    if (e.target instanceof HTMLElement) {
      setFromNote(stepNoteFromId(e.target.id));
    }
  };

  const handleKey: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();

    const t = e.target;
    if (!(t instanceof HTMLSpanElement) || !t.dataset["note"]) {
      return;
    }

    const note = Number(t.dataset["note"]);

    const s = t.closest("[data-step]");
    if (!(s instanceof HTMLDivElement)) {
      return;
    }

    // Clone data
    const newStepData = [...stepData.map(vals => vals.slice())];
    const newJoinData = [...joinData.map(vals => vals.slice())];

    // Step change or join
    const stepIdx = Number(s.dataset["step"]);
    let chord = newStepData[stepIdx]!;
    let joins = newJoinData[stepIdx]!;

    if (chord.indexOf(note) === -1) {
      // Note not set
      chord.push(note);
      if (stepIdx > 0 && stepData[stepIdx - 1]!.includes(note)) {
        // Already playing, join note
        joins.push(note);
      }
    } else {
      if (joins.includes(note)) {
        // Just remove the join
        joins = joins.filter(el => el !== note);
      } else {
        // Remove the note
        chord = chord.filter(el => el !== note);

        // If a joined note follows, remove the join
        let nextStepJoins = newJoinData[stepIdx + 1] || [];
        if (nextStepJoins.includes(note)) {
          nextStepJoins = nextStepJoins.filter(el => el !== note);
          newJoinData[stepIdx + 1] = nextStepJoins;
        }
      }
    }

    newStepData[stepIdx] = chord;
    newJoinData[stepIdx] = joins;

    onStepsChange(newStepData, newJoinData, [stepIdx]);
  };

  const handleRemoveStep: MouseEventHandler<HTMLButtonElement> = e => {
    const t = e.target;
    if (!(t instanceof HTMLButtonElement)) {
      return;
    }

    const stepIdx = Number(t.dataset["removeStep"]);
    const newStepData = [...stepData];
    const newJoinData = [...joinData];
    newStepData.splice(stepIdx, 1);
    newJoinData.splice(stepIdx, 1);
    onStepsChange(newStepData, newJoinData, [Math.max(0, stepIdx - 1)]);
  };

  const handleCopyStep: MouseEventHandler<HTMLButtonElement> = e => {
    const t = e.target;
    if (!(t instanceof HTMLButtonElement)) {
      return;
    }

    const stepIdx = Number(t.dataset["copyStep"]);
    const newStepData = [
      ...stepData.slice(0, stepIdx),
      stepData[stepIdx]!.slice(),
      ...stepData.slice(stepIdx),
    ];
    const newJoinData = [
      ...joinData.slice(0, stepIdx + 1),
      stepData[stepIdx]!.slice(),
      ...joinData.slice(stepIdx + 1),
    ];

    // Don't add step unless it would be lossy
    if (
      newJoinData[newJoinData.length - 1]!.length === 0 &&
      newStepData[newStepData.length - 1]!.length === 0
    ) {
      newJoinData.pop();
      newStepData.pop();
    }

    onStepsChange(newStepData, newJoinData, [stepIdx + 1]);
  };

  const handleDrop: DragEventHandler = e => {
    if (!(e.target instanceof HTMLElement) || !fromNote) {
      return;
    }

    const note = fromNote.note;
    const fromIsActive = stepData[fromNote.step]!.includes(note);
    const toNote = stepNoteFromId(e.target.id);
    const toIsActive = stepData[toNote.step]!.includes(note);
    const remove = fromIsActive && toIsActive;

    let changing = false;
    const stepsChanged = stepData
      .map((_, idx) => idx)
      .filter(idx => {
        if (changing) {
          if (fromNote.step === idx || toNote.step === idx) {
            changing = !changing;
          }
          return true;
        } else {
          if (fromNote.step === idx || toNote.step === idx) {
            changing = !changing;
          }

          return changing;
        }
      });

    const newSteps = structuredClone(stepData);
    const newJoins = structuredClone(joinData);

    let lastPresent = false;
    for (let i = 0; i < stepData.length; i++) {
      if (stepsChanged.includes(i)) {
        newSteps[i] = newSteps[i]!.filter(el => el !== note);
        newJoins[i] = newJoins[i]!.filter(el => el !== note);
        if (!remove) {
          newSteps[i]!.push(note);
          if (lastPresent) {
            newJoins[i]!.push(note);
          }
        }
      }

      lastPresent = newSteps[i]!.includes(note);
    }

    onStepsChange(newSteps, newJoins, stepsChanged);
  };

  const onEnterOver: DragEventHandler = e => {
    if (e.target instanceof HTMLElement && fromNote) {
      const toNote = stepNoteFromId(e.target.id);
      if (fromNote.note === toNote.note && fromNote.step !== toNote.step) {
        // Tell browser this is a drop target
        e.preventDefault();
      }
    }
  };

  const renderKey = (
    active: boolean,
    step: number,
    note: number,
    left = 0,
    isJoin = false,
  ) => (
    <span
      key={note}
      id={`n-${step}-${note}`}
      data-note={note}
      draggable={true}
      onDragStart={onDragStart}
      onClick={handleKey}
      className={(active ? "active " : " ") + (isJoin ? "joined " : " ")}
      style={{ left: left + "px" }}
    />
  );

  return (
    <div
      className="Sequencer"
      onDragEnter={onEnterOver}
      onDragOver={onEnterOver}
      onDrop={handleDrop}
    >
      {stepData.map((activeNotes, i) => (
        <div
          key={i}
          className={`stepRow ${i === currentStepIndex ? "active" : ""}`}
          data-step={i}
        >
          <div className="white">
            {whites.map(({ note }) => {
              const isJoin = joinData[i]!.includes(note);
              return renderKey(
                activeNotes.indexOf(note) !== -1,
                i,
                note,
                0,
                isJoin,
              );
            })}
          </div>
          <div className="black">
            {blacks.map(({ note, left }) => {
              const isJoin = joinData[i]!.includes(note);
              return renderKey(
                activeNotes.indexOf(note) !== -1,
                i,
                note,
                left,
                isJoin,
              );
            })}
          </div>
          <button
            type="button"
            data-remove-step={i}
            onClick={handleRemoveStep}
            title="Remove"
          >
            &times;
          </button>
          <button
            type="button"
            data-copy-step={i}
            onClick={handleCopyStep}
            title="Copy"
          >
            c
          </button>
        </div>
      ))}
    </div>
  );
}

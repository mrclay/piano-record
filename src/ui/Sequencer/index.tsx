import React, { MouseEventHandler } from "react";

import "./index.scss";
import { getPianoKeyLayout } from "../../Piano";

interface SequencerProps {
  currentStepIndex: number;
  onStepsChange(
    stepData: Array<number[]>,
    joinData: Array<number[]>,
    changedStep: number
  ): void;
  stepData: Array<number[]>;
  joinData: Array<number[]>;
}

const { whites, blacks } = getPianoKeyLayout();

export default function Sequencer({
  currentStepIndex,
  onStepsChange,
  stepData,
  joinData,
}: SequencerProps) {
  const handleKey: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();

    const t = e.target;
    if (!(t instanceof HTMLSpanElement) || !t.dataset.note) {
      return;
    }

    const note = Number(t.dataset.note);

    const s = t.closest("[data-step]");
    if (!(s instanceof HTMLDivElement)) {
      return;
    }

    // Clone data
    const newStepData = [...stepData.map(vals => vals.slice())];
    const newJoinData = [...joinData.map(vals => vals.slice())];

    // Step change or join
    const stepIdx = Number(s.dataset.step);
    let chord = newStepData[stepIdx];
    let joins = newJoinData[stepIdx];

    if (chord.indexOf(note) === -1) {
      // Note not set
      chord.push(note);
      if (stepIdx > 0 && stepData[stepIdx - 1].includes(note)) {
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

    onStepsChange(newStepData, newJoinData, stepIdx);
  };

  const handleRemoveStep: MouseEventHandler<HTMLButtonElement> = e => {
    const t = e.target;
    if (!(t instanceof HTMLButtonElement)) {
      return;
    }

    const stepIdx = Number(t.dataset.removeStep);
    const newStepData = [...stepData];
    const newJoinData = [...joinData];
    newStepData.splice(stepIdx, 1);
    newJoinData.splice(stepIdx, 1);
    onStepsChange(newStepData, newJoinData, Math.max(0, stepIdx - 1));
  };

  const handleCopyStep: MouseEventHandler<HTMLButtonElement> = e => {
    const t = e.target;
    if (!(t instanceof HTMLButtonElement)) {
      return;
    }

    const stepIdx = Number(t.dataset.copyStep);
    const newStepData = [
      ...stepData.slice(0, stepIdx),
      stepData[stepIdx].slice(),
      ...stepData.slice(stepIdx),
    ];
    const newJoinData = [
      ...joinData.slice(0, stepIdx),
      joinData[stepIdx].slice(),
      ...joinData.slice(stepIdx),
    ];
    onStepsChange(newStepData, newJoinData, stepIdx + 1);
  };

  const renderKey = (
    active: boolean,
    note: number,
    left = 0,
    isJoin = false
  ) => (
    <span
      key={note}
      data-note={note}
      className={(active ? "active " : " ") + (isJoin ? "joined " : " ")}
      style={{ left: left + "px" }}
    />
  );

  return (
    <div className="Sequencer" onMouseDown={handleKey}>
      {stepData.map((activeNotes, i) => (
        <div
          key={i}
          className={`stepRow ${i === currentStepIndex ? "active" : ""}`}
          data-step={i}
        >
          <div className="white">
            {whites.map(({ note }) => {
              const isJoin = joinData[i].includes(note);
              return renderKey(
                activeNotes.indexOf(note) !== -1,
                note,
                0,
                isJoin
              );
            })}
          </div>
          <div className="black">
            {blacks.map(({ note, left }) => {
              const isJoin = joinData[i].includes(note);
              return renderKey(
                activeNotes.indexOf(note) !== -1,
                note,
                left,
                isJoin
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

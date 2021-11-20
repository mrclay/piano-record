import React, { MouseEventHandler, useMemo } from "react";

import { RANGE } from "../../constants";
import { ActiveKeys } from "../../Piano";

import "./index.scss";

interface KeyboardProps {
  activeKeys: ActiveKeys;
  currentStepIndex?: number;
  onKeyClick?(note: number): void;
  onStepsChange?(
    stepData: Array<number[]>,
    joinData: Array<number[]>,
    changedStep: number
  ): void;
  stepData?: Array<number[]>;
  joinData?: Array<number[]>;
}

export default function Keyboard({
  activeKeys,
  currentStepIndex,
  onKeyClick,
  onStepsChange,
  stepData,
  joinData,
}: KeyboardProps) {
  const { whites, blacks } = useMemo(() => {
    const whites = [];
    const blacks = [];
    let note;
    let mod;
    let left = 38;

    for (note = RANGE[0]; note <= RANGE[1]; note++) {
      mod = note % 12;
      if (mod === 1 || mod === 3 || mod === 6 || mod === 8 || mod === 10) {
        blacks.push({ note, left });
        left += 34;
        if (mod === 3 || mod === 10) {
          // skip a key
          left += 34;
        }
      } else {
        whites.push({ note });
      }
    }

    return { whites, blacks };
  }, []);

  const handleKey: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();

    const t = e.target;
    if (!(t instanceof HTMLSpanElement) || !t.dataset.note) {
      return;
    }

    const note = Number(t.dataset.note);

    const s = t.closest("[data-step]");

    if (s instanceof HTMLDivElement) {
      if (stepData && joinData && onStepsChange) {
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
              nextStepJoins = nextStepJoins.filter(el => el === note);
              newJoinData[stepIdx + 1] = nextStepJoins;
            }
          }
        }

        newStepData[stepIdx] = chord;
        newJoinData[stepIdx] = joins;

        onStepsChange(newStepData, newJoinData, stepIdx);
      }

      return;
    }

    if (onKeyClick) {
      onKeyClick(note);
    }
  };

  const handleRemoveStep: MouseEventHandler<HTMLButtonElement> = e => {
    const t = e.target;
    if (
      !(t instanceof HTMLButtonElement) ||
      !stepData ||
      !joinData ||
      !onStepsChange
    ) {
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
    if (
      !(t instanceof HTMLButtonElement) ||
      !stepData ||
      !joinData ||
      !onStepsChange
    ) {
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
    <div className="Keyboard" onMouseDown={handleKey}>
      {stepData &&
        joinData &&
        stepData.map((activeNotes, i) => (
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
      <div className={onKeyClick ? "piano" : "piano noinput"}>
        <div className="white">
          {whites.map(({ note }) => renderKey(!!activeKeys[note], note))}
        </div>
        <div className="black">
          {blacks.map(({ note, left }) =>
            renderKey(!!activeKeys[note], note, left)
          )}
        </div>
      </div>
    </div>
  );
}

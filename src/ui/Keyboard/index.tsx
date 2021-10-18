import React, { MouseEventHandler, useMemo } from "react";

import { RANGE } from "../../constants";
import { ActiveKeys } from "../../Piano";

import "./index.scss";

interface KeyboardProps {
  activeKeys: ActiveKeys;
  currentStepIndex?: number;
  onKeyClick?(note: number): void;
  onStepsChange?(steps: Array<number[]>, changedChord: number[]): void;
  steps?: Array<number[]>;
}

export default function Keyboard({
  activeKeys,
  currentStepIndex,
  onKeyClick,
  onStepsChange,
  steps,
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
      if (steps && onStepsChange) {
        const stepIdx = Number(s.dataset.step);
        let chord = steps[stepIdx];
        if (chord.indexOf(note) === -1) {
          chord.push(note);
        } else {
          chord = chord.filter(el => el !== note);
        }

        const newSteps = [...steps];
        newSteps[stepIdx] = chord;
        onStepsChange(newSteps, chord);
      }

      return;
    }

    if (onKeyClick) {
      onKeyClick(note);
    }
  };

  const renderKey = (active: boolean, note: number, left = 0) => (
    <span
      key={note}
      data-note={note}
      className={active ? "active" : ""}
      style={{ left: left + "px" }}
    />
  );

  return (
    <div className="Keyboard" onMouseDown={handleKey}>
      {typeof steps !== "undefined" &&
        steps.map((activeNotes, i) => (
          <div
            key={i}
            className={`stepRow ${i === currentStepIndex ? "active" : ""}`}
            data-step={i}
          >
            <div className="white">
              {whites.map(({ note }) =>
                renderKey(activeNotes.indexOf(note) !== -1, note)
              )}
            </div>
            <div className="black">
              {blacks.map(({ note, left }) =>
                renderKey(activeNotes.indexOf(note) !== -1, note, left)
              )}
            </div>
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

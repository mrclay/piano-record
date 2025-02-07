import React, {
  DragEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";

import "./index.scss";
import { getPianoKeyLayout } from "../Keyboard";
import { Sequencer } from "../../Sequencer";

interface SequencerProps {
  sequencer: Sequencer;
  currentStepIndex: number;
  onStepsChange(changedSteps: number[]): void;
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
  sequencer,
  currentStepIndex,
  onStepsChange,
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
    sequencer.stepData = [...sequencer.stepData.map(vals => vals.slice())];
    sequencer.joinData = [...sequencer.joinData.map(vals => vals.slice())];

    // Step change or join
    const stepIdx = Number(s.dataset["step"]);
    let chord = sequencer.stepData[stepIdx]!;
    let joins = sequencer.joinData[stepIdx]!;

    if (chord.indexOf(note) === -1) {
      // Note not set
      chord.push(note);
      if (stepIdx > 0 && sequencer.stepData[stepIdx - 1]!.includes(note)) {
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
        let nextStepJoins = sequencer.joinData[stepIdx + 1] || [];
        if (nextStepJoins.includes(note)) {
          nextStepJoins = nextStepJoins.filter(el => el !== note);
          sequencer.joinData[stepIdx + 1] = nextStepJoins;
        }
      }
    }

    sequencer.stepData[stepIdx] = chord;
    sequencer.joinData[stepIdx] = joins;

    onStepsChange([stepIdx]);
  };

  const handleRemoveStep: MouseEventHandler<HTMLButtonElement> = e => {
    const t = e.target;
    if (!(t instanceof HTMLButtonElement)) {
      return;
    }

    const stepIdx = Number(t.dataset["removeStep"]);
    const changed = sequencer.removeStep(stepIdx);
    onStepsChange(changed);
  };

  const handleCopyStep: MouseEventHandler<HTMLButtonElement> = e => {
    const t = e.target;
    if (!(t instanceof HTMLButtonElement)) {
      return;
    }

    const stepIdx = Number(t.dataset["copyStep"]);
    const changed = sequencer.copyStep(stepIdx);
    onStepsChange(changed);
  };

  const handleDrop: DragEventHandler = e => {
    if (!(e.target instanceof HTMLElement) || !fromNote) {
      return;
    }

    const note = fromNote.note;
    const fromIsActive = sequencer.stepData[fromNote.step]!.includes(note);
    const toNote = stepNoteFromId(e.target.id);
    const toIsActive = sequencer.stepData[toNote.step]!.includes(note);
    const remove = fromIsActive && toIsActive;

    let changing = false;
    const stepsChanged = sequencer.stepData
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

    let lastPresent = false;
    for (let i = 0; i < sequencer.stepData.length; i++) {
      if (stepsChanged.includes(i)) {
        sequencer.stepData[i] = sequencer.stepData[i]!.filter(
          el => el !== note,
        );
        sequencer.joinData[i] = sequencer.joinData[i]!.filter(
          el => el !== note,
        );
        if (!remove) {
          sequencer.stepData[i]!.push(note);
          if (lastPresent) {
            sequencer.joinData[i]!.push(note);
          }
        }
      }

      lastPresent = sequencer.stepData[i]!.includes(note);
    }

    onStepsChange(stepsChanged);
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
      {sequencer.stepData.map((activeNotes, i) => (
        <div
          key={i}
          className={`stepRow ${i === currentStepIndex ? "active" : ""}`}
          data-step={i}
        >
          <div className="white">
            {whites.map(({ note }) => {
              const isJoin = sequencer.joinData[i]!.includes(note);
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
              const isJoin = sequencer.joinData[i]!.includes(note);
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

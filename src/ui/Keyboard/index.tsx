import React, { MouseEventHandler } from "react";

import { ActiveKeys, getPianoKeyLayout } from "../../Piano";

import "./index.scss";

interface KeyboardProps {
  activeKeys: ActiveKeys;
  onKeyClick?(note: number): void;
}

const { whites, blacks } = getPianoKeyLayout();

export default function Keyboard({ activeKeys, onKeyClick }: KeyboardProps) {
  const handleKey: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();

    const t = e.target;
    if (!(t instanceof HTMLSpanElement) || !t.dataset.note || !onKeyClick) {
      return;
    }

    const note = Number(t.dataset.note);
    onKeyClick(note);
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
      <div className={onKeyClick ? "piano" : "piano noinput"}>
        <div className="white">
          {whites.map(({ note }) => renderKey(activeKeys.has(note), note))}
        </div>
        <div className="black">
          {blacks.map(({ note, left }) =>
            renderKey(activeKeys.has(note), note, left)
          )}
        </div>
      </div>
    </div>
  );
}

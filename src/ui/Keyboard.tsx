import React, { MouseEventHandler } from "react";

import { RANGE } from "../constants";
import { ActiveKeys } from "../Piano";

interface KeyboardProps {
  activeKeys: ActiveKeys;
  onKeyClick?(note: number): void;
}

export default function Keyboard({ activeKeys, onKeyClick }: KeyboardProps) {
  const handleKey: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();

    const target = e.target;
    if (!(target instanceof HTMLSpanElement) || !target.dataset.note) {
      return;
    }

    if (onKeyClick) {
      onKeyClick(Number(target.dataset.note));
    }
  };

  const renderKey = (active: boolean, note: number, left = 0) => {
    return (
      <span
        key={note}
        data-note={note}
        className={active ? "active" : ""}
        style={{ left: left + "px" }}
      />
    );
  };

  const whites = [];
  const blacks = [];
  let note;
  let mod;
  let left = 36;
  let active;

  for (note = RANGE[0]; note <= RANGE[1]; note++) {
    mod = note % 12;
    active = !!activeKeys[note];
    if (mod === 1 || mod === 3 || mod === 6 || mod === 8 || mod === 10) {
      blacks.push(renderKey(active, note, left));
      left += 34;
      if (mod === 3 || mod === 10) {
        // skip a key
        left += 34;
      }
    } else {
      whites.push(renderKey(active, note));
    }
  }

  return (
    <div onClick={handleKey} id="piano" className={onKeyClick ? "" : "noinput"}>
      <div className="white">{whites}</div>
      <div className="black">{blacks}</div>
    </div>
  );
}

import React, { MouseEventHandler, useCallback, useMemo } from "react";

import { ActiveKeys } from "../../Piano";

import "./index.scss";
import * as C from "../../constants";

interface KeyboardProps {
  activeKeys: ActiveKeys;
  onKeyClick?(note: number): void;
}

export default function Keyboard({ activeKeys, onKeyClick }: KeyboardProps) {
  const { whites, blacks } = useMemo(() => getPianoKeyLayout(), []);

  const handleKey: MouseEventHandler<HTMLDivElement> = useCallback(
    e => {
      e.preventDefault();

      const t = e.target;
      if (!(t instanceof HTMLSpanElement) || !t.dataset.note || !onKeyClick) {
        return;
      }

      const note = Number(t.dataset.note);
      onKeyClick(note);
    },
    [onKeyClick]
  );

  return (
    <div className={`Keyboard Keyboard--traditional`} onMouseDown={handleKey}>
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

const renderKey = (active: boolean, note: number, left = 0, isJoin = false) => (
  <span
    key={note}
    data-note={note}
    className={(active ? "active " : " ") + (isJoin ? "joined " : " ")}
    style={{ left: left + "px" }}
  />
);

export function getPianoKeyLayout() {
  const whites = [];
  const blacks = [];
  let note;
  let mod;
  let left = 38;
  const whiteOffset = 34;

  for (note = C.RANGE[0]; note <= C.RANGE[1]; note++) {
    mod = note % 12;
    if (mod === 1 || mod === 3 || mod === 6 || mod === 8 || mod === 10) {
      blacks.push({ note, left });
      left += whiteOffset;
      if (mod === 3 || mod === 10) {
        // skip a key
        left += whiteOffset;
      }
    } else {
      whites.push({ note });
    }
  }

  return { whites, blacks };
}

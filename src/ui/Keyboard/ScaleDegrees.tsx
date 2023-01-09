import React, {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

import { ActiveKeys } from "../../Piano";

import "./index.scss";
import * as C from "../../constants";
import { Char } from "../../music-theory/constants";

export const scaleDegRange = [48, 72] as const;

interface ScaleDegreesProps {
  activeKeys: ActiveKeys;
  keyLabels: ReadonlyArray<ReactNode>;
  onKeyClick?(note: number): void;
  range?: readonly [first: number, last: number];
}

export default function ScaleDegrees({
  activeKeys,
  keyLabels,
  onKeyClick,
  range = scaleDegRange,
}: ScaleDegreesProps) {
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

  const notes = useMemo(
    () => [...Array(range[1] - range[0]).keys()].map(idx => range[0] + idx),
    [range]
  );

  return (
    <div className={`Keyboard Keyboard--scaleDegrees`} onMouseDown={handleKey}>
      <div className={onKeyClick ? "piano" : "piano noinput"}>
        {notes.map(note => (
          <span
            key={note}
            data-note={note}
            className={[activeKeys.has(note) ? "active " : ""].join(" ")}
          >
            {keyLabels[note % 12]}
          </span>
        ))}
      </div>
    </div>
  );
}

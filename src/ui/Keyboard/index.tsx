import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Piano, { ActiveKeys, PianoListener } from "../../Piano";

import "./index.scss";
import * as C from "../../constants";
import { ActiveScaleDegrees } from "../../music-theory/ScaleDegree";

interface KeyboardProps {
  activeKeys?: ActiveKeys;
  onKeyClick?(note: number): void;
  piano?: Piano;
  scaleDegrees?: ActiveScaleDegrees;
}

export default function Keyboard({
  activeKeys,
  onKeyClick,
  piano,
  scaleDegrees,
}: KeyboardProps) {
  const { whites, blacks } = useMemo(() => getPianoKeyLayout(), []);
  const [localActiveKeys, setActiveKeys] = useState<ActiveKeys>(
    activeKeys || piano?.activeKeys || new Set(),
  );

  useEffect(() => {
    if (activeKeys) {
      setActiveKeys(activeKeys);
      return;
    }

    const listener: PianoListener<"activeKeysChange"> = val =>
      setActiveKeys(val);

    piano?.addEventListener("activeKeysChange", listener);

    return () => piano?.removeEventListener("activeKeysChange", listener);
  }, [activeKeys, piano]);

  const handleKey: MouseEventHandler<HTMLDivElement> = useCallback(
    e => {
      e.preventDefault();

      const t = e.target;
      if (
        !(t instanceof HTMLSpanElement) ||
        !t.dataset["note"] ||
        !onKeyClick
      ) {
        return;
      }

      const note = Number(t.dataset["note"]);
      onKeyClick(note);
    },
    [onKeyClick],
  );

  return (
    <div className={`Keyboard Keyboard--traditional`} onMouseDown={handleKey}>
      <div className={onKeyClick ? "piano" : "piano noinput"}>
        <div className="white">
          {whites.map(({ note }) =>
            renderKey(scaleDegrees, localActiveKeys.has(note), note),
          )}
        </div>
        <div className="black">
          {blacks.map(({ note, left }) =>
            renderKey(scaleDegrees, localActiveKeys.has(note), note, left),
          )}
        </div>
      </div>
    </div>
  );
}

const renderKey = (
  scaleDegrees: ActiveScaleDegrees | undefined,
  active: boolean,
  note: number,
  left = 0,
  isJoin = false,
) => {
  const degree = scaleDegrees?.get(note) || false;
  return (
    <span
      key={note}
      data-note={note}
      className={(active ? "active " : " ") + (isJoin ? "joined " : " ")}
      style={{ left: left + "px" }}
    >
      {degree && <span>{degree}</span>}
    </span>
  );
};

interface PhysicalKey {
  note: number;
  left?: number;
}

export function getPianoKeyLayout() {
  const whites: PhysicalKey[] = [];
  const blacks: PhysicalKey[] = [];
  let mod;
  let left = 38;
  const whiteOffset = 34;

  for (let note = C.RANGE[0]; note <= C.RANGE[1]; note++) {
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

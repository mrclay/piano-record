import type { QRL } from "@builder.io/qwik";
import { $, component$ } from "@builder.io/qwik";
import * as C from "../../constants";
import type { ActiveKeys } from "~/Piano";
import "./index.scss";

interface KeyboardProps {
  activeKeys: ActiveKeys;
  onKeyClick?: QRL<(note: number) => void>;
}

const Keyboard = component$(({ activeKeys, onKeyClick }: KeyboardProps) => {
  const { whites, blacks } = getPianoKeyLayout();

  const handleKey = $((e: Event) => {
    const t = e.target;
    if (!(t instanceof HTMLSpanElement) || !t.dataset.note || !onKeyClick) {
      return;
    }

    onKeyClick(Number(t.dataset.note));
  });

  return (
    <div
      class={`Keyboard Keyboard--traditional`}
      preventdefault:mousedown
      onMouseDown$={handleKey}
    >
      <div class={onKeyClick ? "piano" : "piano noinput"}>
        <div class="white">
          {whites.map(({ note }) => renderKey(activeKeys.has(note), note))}
        </div>
        <div class="black">
          {blacks.map(({ note, left }) =>
            renderKey(activeKeys.has(note), note, left)
          )}
        </div>
      </div>
    </div>
  );
});

const renderKey = (active: boolean, note: number, left = 0, isJoin = false) => (
  <span
    key={note}
    data-note={note}
    class={(active ? "active " : " ") + (isJoin ? "joined " : " ")}
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

export default Keyboard;

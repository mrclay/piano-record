import React, { ReactNode } from "react";
import Key from "../music-theory/Key";

interface Chord {
  func: string;
  root: string;
  type: string;
  bassNote: string;
}

const remove7thMap: Record<string, string | undefined> = {
  m7: "m",
  maj7: "",
  "7": "",
  m7b5: "dim",
  "+": "+",
};

export function getRenderers(key: Key, sevenths: boolean) {
  const rom = (str: string) => <b className="roman">{str}</b>;

  const note = (func: string) => <b className="roman">{f7(func).root}</b>;

  // Does not allow removing sevenths
  const f7 = (str: string): Chord => {
    const [func, type = "", three = ""] = str.split(" ");
    const root = key.getNoteFromRoman(func).toString();
    const bassNote = three
      ? key.getNoteFromRoman(three.replace("/", "")).toString()
      : "";
    return {
      func,
      type,
      root,
      bassNote,
    };
  };

  // Allows removing 7ths
  const f = (str: string): Chord => {
    let { func, root, type, bassNote } = f7(str);
    if (!sevenths) {
      type = remove7thMap[type] || "";
    }
    return { func, root, type, bassNote };
  };

  function chords(...els: Chord[]) {
    const out: ReactNode[] = [];
    els.forEach((el, i) => {
      const elKey = Object.values(el).join();
      out.push(
        <span key={elKey} className="chord" title={`${el.func} ${el.type}`}>
          <span className="note">{el.root}</span>
          <span className="qual">{el.type}</span>
          {el.bassNote !== "" && <span className="bass">/{el.bassNote}</span>}
        </span>
      );
      if (i < els.length - 1) {
        out.push(
          <span key={elKey + "sep"} className="sep">
            {" "}
            .{" "}
          </span>
        );
      }
    });
    return out;
  }

  return { rom, f, f7, chords, note };
}

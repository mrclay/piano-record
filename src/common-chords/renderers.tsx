import React, { ReactNode } from "react";
import { unicodeAccidentalsMap } from "../music-theory/constants";
import Key from "../music-theory/Key";
import { useStore } from "../store";

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

export const Sep = () => <span className="sep"> &bull; </span>;

const rom = (str: string) => <b className="roman">{str}</b>;

export function getRenderers(key: Key) {
  const [sevenths] = useStore.sevenths();
  const [relative] = useStore.relative();

  const note = (func: string) => f7(func).root;

  // Does not allow removing sevenths
  const f7 = (str: string): Chord => {
    const [func, type = "", three = ""] = str.split(" ");
    const root = key.getNoteFromRoman(func).toString();
    const bassNote = three
      ? key.getNoteFromRoman(three.replace("/", "")).toString()
      : "";
    return {
      func: func
        .replace(/^#/, unicodeAccidentalsMap[1])
        .replace(/^b/, unicodeAccidentalsMap[-1]),
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
      const [func1, func2 = ""] = el.func.split("/");

      let type = el.type;
      if (relative) {
        type = type.replace(/^m(7|$)/, "$1");
      }

      out.push(
        <span key={elKey} className="chord" title={`${el.func} ${el.type}`}>
          <span className={relative ? "func" : "note"}>
            {relative ? func1 : el.root}
          </span>
          {type !== "" && <span className="qual">{type}</span>}
          {relative && func2 !== "" && <span className="func">/{func2}</span>}
          {!relative && el.bassNote !== "" && (
            <span className="bass">/{el.bassNote}</span>
          )}
        </span>
      );

      if (i < els.length - 1) {
        out.push(<Sep key={elKey + "sep"} />);
      }
    });
    return out;
  }

  return { rom, f, f7, chords, note, Sep };
}

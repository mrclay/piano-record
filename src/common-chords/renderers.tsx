import React, { ReactNode } from "react";
import Key from "../music-theory/Key";

export type Chord = [
  roman: string,
  note: string,
  type: string,
  bassNote: string
];

const remove7thMap: Record<string, string | undefined> = {
  m7: "m",
  maj7: "",
  "7": "",
  m7b5: "dim",
  "+": "+",
};

export function getRenderers(key: Key, sevenths: boolean) {
  const rom = (str: string) => <b className="roman">{str}</b>;

  const f7 = (str: string): Chord => {
    const [one, two = "", three = ""] = str.split(" ");
    const note = key.getNoteFromRoman(one).toString();
    const bassNote = three
      ? key.getNoteFromRoman(three.replace("/", "")).toString()
      : "";
    return [one, note, two, bassNote];
  };

  // Allows removing 7ths
  const f = (str: string): Chord => {
    const [roman, note, type, bassNote] = f7(str);
    return sevenths
      ? [roman, note, type, bassNote]
      : [roman, note, remove7thMap[type] || "", bassNote];
  };

  function chords(...els: Chord[]) {
    const out: ReactNode[] = [];
    els.forEach((el, i) => {
      out.push(
        <span key={el.join()} className="chord" title={`${el[0]} ${el[2]}`}>
          <span className="note">{el[1]}</span>
          <span className="qual">{el[2]}</span>
          {el[3] !== "" && <span className="bass">/{el[3]}</span>}
        </span>
      );
      if (i < els.length - 1) {
        out.push(
          <span key={el.join() + "sep"} className="sep">
            {" "}
            .{" "}
          </span>
        );
      }
    });
    return out;
  }

  return { rom, f, f7, chords };
}

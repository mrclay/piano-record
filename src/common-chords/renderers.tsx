import React, { ReactNode } from "react";
import { unicodeAccidentalsMap } from "../music-theory/constants";
import Key from "../music-theory/Key";
import Paths from "../Paths";
import { useStore } from "../store";

interface Chord {
  func: string;
  root: string;
  type: string;
  bassNote: string;
  songUrl: string;
}

const remove7thMap: Record<string, string | undefined> = {
  m7: "m",
  maj7: "",
  "7": "",
  m7b5: "°",
  "+": "+",
};

const fancyMap: Record<string, string | undefined> = {
  dim7: "°⁷",
  m7b5: "ø⁷",
};

export const Sep = () => <span className="sep"> &bull; </span>;

const rom = (str: string) => <b className="roman">{str}</b>;

export function getRenderers(key: Key, offset: number) {
  const [sevenths] = useStore.sevenths();
  const [relative] = useStore.relative();

  const note = (func: string) => f7(func).root;

  // Does not allow removing sevenths
  const f7 = (str: string, songUrl = ""): Chord => {
    const [func, type = "", three = ""] = str.split(" ");
    const root = key.getNoteFromRoman(func).toString();
    const bassNote = three
      ? key.getNoteFromRoman(three.replace("/", "")).toString()
      : "";

    let url = songUrl.replace(Paths.home, "");
    if (url) {
      url += offset ? `?transpose=${offset}` : "";
    }

    return {
      func: func
        .replace(/^#/, unicodeAccidentalsMap[1])
        .replace(/^b/, unicodeAccidentalsMap[-1]),
      type,
      root,
      bassNote,
      songUrl: url,
    };
  };

  // Allows removing 7ths
  const f = (str: string, songUrl = ""): Chord => {
    const chord = f7(str, songUrl);
    if (!sevenths) {
      chord.type = remove7thMap[chord.type] || "";
    }
    return chord;
  };

  function chords(...els: Chord[]) {
    const out: ReactNode[] = [];

    els.forEach((el, i) => {
      const elKey = Object.values(el).join();
      const [func1, func2 = ""] = el.func.split("/");
      const type = fancyMap[el.type] || el.type;

      const content = (
        <>
          <span>
            <span className="note">{el.root}</span>
            {type !== "" && <span className="qual">{type}</span>}
            {el.bassNote !== "" && <span className="bass">/{el.bassNote}</span>}
          </span>
          {relative && (
            <span>
              <span className="func">{func1}</span>
              {type !== "" && (
                <span className="qual">{type.replace(/^m(7|$)/, "$1")}</span>
              )}
              {func2 !== "" && <span className="func">/{func2}</span>}
            </span>
          )}
        </>
      );

      if (el.songUrl) {
        out.push(
          <a key={elKey + "but"} href={el.songUrl} target="_blank">
            {content}
          </a>
        );
      } else {
        out.push(<span key={elKey}>{content}</span>);
      }

      if (i < els.length - 1) {
        out.push(<Sep key={elKey + "sep"} />);
      }
    });

    return <h2 className="chord">{out}</h2>;
  }

  return { rom, f, f7, chords, note, Sep };
}

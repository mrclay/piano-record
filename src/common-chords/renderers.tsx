import React from "react";
import { ThirdQuality, unicodeAccidentalsMap } from "../music-theory/constants";
import Key from "../music-theory/Key";
import Paths from "../Paths";
import { Chord } from "./ChordSet";

const rom = (str: string) => <b className="roman">{str}</b>;

export function getRenderers(key: Key, offset: number) {
  const majKey = key.getQuality() === ThirdQuality.MAJOR ? key : Key.major(key.getTonicNote());

  const note = (func: string) => f7(func).root;

  // Does not allow removing sevenths
  const f7 = (str: string, songUrl = ""): Chord => {
    const [func, type = "", three = ""] = str.split(" ");
    const root = majKey.getNoteFromRoman(func).toString();
    const bassNote = three
      ? majKey.getNoteFromRoman(three.replace("/", "")).toString()
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
      require7th: true,
    };
  };

  // Allows removing 7ths
  const f = (str: string, songUrl = ""): Chord => {
    const chord = f7(str, songUrl);
    chord.require7th = false;
    return chord;
  };

  return { rom, f, f7, note };
}

import React, { MouseEvent, ReactNode, useCallback, useRef } from "react";
import Ops from "../Ops";
import { useStore } from "../store";
import { useCommonChordsQuery } from "./useCommonChordsQuery";
import { sequenceFromStream } from "../Sequencer";
import { ChordSetKeyboard } from "./ChordSetKeyboard";

export interface Chord {
  func: string;
  root: string;
  type: string;
  bassNote: string;
  songChords?: ReactNode;
  songUrl: string;
  require7th: boolean;
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

const isolateSong = (songUrl: string) => songUrl.split("/").pop();

interface ChordSetProps {
  els: Chord[];
  desc?: ReactNode;
}

interface ChordSetRef {
  song: string;
  songChords?: ReactNode;
}

export function ChordSet({ desc = null, els }: ChordSetProps): JSX.Element {
  const ref = useRef<ChordSetRef>({ song: "" }).current;
  const { sevenths } = useCommonChordsQuery();
  const [chordSet, setChordSet] = useStore.chordSet();
  const [song, setSong] = useStore.song();
  ref.song = song;
  const [, setSongChords] = useStore.songChords();
  const [recorder] = useStore.recorder();
  const [sequencer, setSequencer] = useStore.sequencer();
  const [piano] = useStore.piano();
  const [offset] = useStore.offset();

  const closePiano = useCallback(() => {
    if (sequencer.isPlaying()) {
      sequencer.stop();
    } else {
      recorder.repeatAfterMs = null;
      recorder.stop();
    }

    setChordSet({});
    setSong("");
  }, [sequencer, recorder]);

  const selectChord = (e: MouseEvent<HTMLAnchorElement>, chord: Chord) => {
    e.preventDefault();

    let stream = "";
    let setup;

    if (chord.songUrl.includes("/sequence/songs/")) {
      stream = isolateSong(chord.songUrl) || "";
      const { bpm, bps, newStepData, newJoinData } = sequenceFromStream(
        stream,
        offset
      );
      if (!newJoinData || !newStepData) {
        return;
      }

      piano.shepardMode = false;
      Object.assign(sequencer, {
        bpm,
        bps,
        stepData: newStepData,
        joinData: newJoinData,
      });
      setup = () => {
        setTimeout(() => sequencer.start(), 100);
      };
    } else {
      const [, streamAndName] = chord.songUrl.split(
        /\/piano\/(?:songs|record)\//
      );
      stream = streamAndName.replace(/(\/|\?).*/, "");
      setup = () => {
        recorder.setOperations(Ops.operationsFromStream(stream, offset));
        recorder.repeatAfterMs = 1e3;
        recorder.play();
      };
    }

    if (ref.song !== stream || chordSet !== ref) {
      sequencer.stop();
      recorder.stop();

      ref.song = stream;
      setSongChords(chord.songChords);
      setChordSet(ref);
      setSong(stream);
      setup();
    } else {
      closePiano();
    }
  };

  const setIsActive = Boolean(
    song && els.some(el => isolateSong(el.songUrl) === song)
  );

  return (
    <>
      <h2 className="chordSet d-flex align-items-center flex-wrap">
        {els.map((el, i) => {
          const [func1, func2 = ""] = el.func.split("/");

          const dimmed = setIsActive && song !== isolateSong(el.songUrl);

          let type = el.type;
          if (!sevenths && !el.require7th) {
            type = remove7thMap[type] || "";
          }
          type = fancyMap[type] || type;

          const content = (
            <>
              <span>
                <span className="note">{el.root}</span>
                {type !== "" && <span className="qual">{type}</span>}
                {el.bassNote !== "" && (
                  <span className="bass">/{el.bassNote}</span>
                )}
              </span>
              <span>
                <span className="func">{func1}</span>
                {type !== "" && (
                  <span className="qual">{type.replace(/^m(7|$)/, "$1")}</span>
                )}
                {func2 !== "" && <span className="func">/{func2}</span>}
              </span>
            </>
          );

          const elKey = Object.values(el).join() + type;
          return el.songUrl ? (
            <a
              key={elKey + "but"}
              className={`link-info ${dimmed && "opacity-50"}`}
              href={el.songUrl}
              target="_blank"
              rel="noreferrer"
              onClick={e => selectChord(e, el)}
            >
              {content}
            </a>
          ) : (
            <span key={elKey} className={dimmed ? "opacity-50" : ""}>
              {content}
            </span>
          );
        })}
      </h2>
      {desc}
      {chordSet === ref && <ChordSetKeyboard close={closePiano} />}
    </>
  );
}

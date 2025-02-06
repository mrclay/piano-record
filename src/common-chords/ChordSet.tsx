import React, {
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import clsx from "clsx";

import Ops from "../Ops";
import { useStore } from "../store";
import { useCommonChordsQuery } from "./useCommonChordsQuery";
import { sequenceFromStream, SequencerListener } from "../Sequencer";
import { ChordSetKeyboard } from "./ChordSetKeyboard";
import { pushTourItems, TourContext } from "../TourContext";
import { RecorderListener, RecorderState } from "../Recorder";

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

export function ChordSet({ desc = null, els }: ChordSetProps): ReactNode {
  const setKey = useMemo(
    () => els.map(el => `${el.func}${el.type}`).join(),
    [],
  );
  const { tourState, activeItem, tourDispatch } = useContext(TourContext);

  const isActiveSet = activeItem?.setKey === setKey;
  const isRegistered = tourState.items.some(el => el.setKey === setKey);
  if (!isRegistered) {
    // Add our chords to the tour w/o triggering rerender.
    pushTourItems(tourState.items, setKey, els);
  }

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const songRef = useRef<ChordSetRef>({ song: "" }).current;
  const { sevenths } = useCommonChordsQuery();
  const [chordSet, setChordSet] = useStore.chordSet();
  const [song, setSong] = useStore.song();
  songRef.song = song;
  const [, setSongChords] = useStore.songChords();
  const [recorder] = useStore.recorder();
  const [sequencer, setSequencer] = useStore.sequencer();
  const isPlaying =
    sequencer.isPlaying() || recorder.getState() === RecorderState.playing;
  const [piano] = useStore.piano();
  const [offset] = useStore.offset();

  useEffect(() => {
    if (isPlaying && !activeItem) {
      closePiano();
      return;
    }

    if (isPlaying || !activeItem || activeItem.setKey !== setKey) {
      return;
    }

    if (activeItem.chord) {
      activateChord(activeItem.chord);
    }
  }, [tourState]);

  useEffect(() => {
    const onSequenceRepeat: SequencerListener<"repeat"> = ({ plays }) => {
      if (plays >= 2) {
        sequencer.stop();
        tourDispatch({ type: "next" });
      }
    };
    const onRecorderRepeat: RecorderListener<"complete"> = ({ plays }) => {
      if (plays >= 2) {
        recorder.stop();
        tourDispatch({ type: "next" });
      }
    };
    if (isActiveSet) {
      sequencer.addEventListener("repeat", onSequenceRepeat);
      recorder.addEventListener("complete", onRecorderRepeat);
    }

    return () => {
      sequencer.removeEventListener("repeat", onSequenceRepeat);
      recorder.removeEventListener("complete", onRecorderRepeat);
    };
  }, [recorder, sequencer, isActiveSet]);

  const closePiano = useCallback(() => {
    if (sequencer.isPlaying()) {
      sequencer.stop();
    } else {
      recorder.repeatAfterMs = null;
      recorder.stop();
    }
    if (activeItem) {
      tourDispatch({ type: "reset" });
    }

    setChordSet({});
    setSong("");
  }, [sequencer, recorder, activeItem]);

  const selectChord = (e: MouseEvent<HTMLAnchorElement>, chord: Chord) => {
    e.preventDefault();
    activateChord(chord);
  };

  const activateChord = (chord: Chord) => {
    let stream = "";
    let setup;

    if (chord.songUrl.includes("/sequence/songs/")) {
      stream = isolateSong(chord.songUrl) || "";
      const { bpm, bps, newStepData, newJoinData, groups } = sequenceFromStream(
        stream,
        offset,
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
      sequencer.setGroups(groups);
      sequencer.setStep(0);
      setup = () => {
        setTimeout(() => sequencer.start(), 100);
      };
    } else {
      const [, streamAndName = ""] = chord.songUrl.split(
        /\/piano\/(?:songs|record)\//,
      );
      stream = streamAndName.replace(/(\/|\?).*/, "");
      setup = () => {
        recorder.setOperations(Ops.operationsFromStream(stream, offset));
        recorder.repeatAfterMs = 1e3;
        recorder.play();
      };
    }

    if (songRef.song !== stream || chordSet !== songRef) {
      sequencer.stop();
      recorder.stop();

      songRef.song = stream;
      setSongChords(chord.songChords);
      setChordSet(songRef);
      setSong(stream);
      setup();

      setTimeout(() => {
        wrapperRef.current?.scrollIntoView({ block: "nearest" });
      }, 100);
    } else {
      closePiano();
    }
  };

  return (
    <div ref={wrapperRef}>
      <h2 className="chordSet d-flex align-items-center flex-wrap">
        {els.map(el => {
          const [func1, func2 = ""] = el.func.split("/");

          const playing = song && song === isolateSong(el.songUrl);
          const dimmed = song && song !== isolateSong(el.songUrl);

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
              className={clsx({
                "text-info": true,
                "opacity-50": dimmed,
                "fw-normal": playing,
                "fw-light": !playing,
              })}
              href={el.songUrl}
              target="_blank"
              rel="noreferrer"
              onClick={e => selectChord(e, el)}
            >
              {content}
            </a>
          ) : (
            <span
              key={elKey}
              className={clsx({
                "text-info": true,
                "opacity-50": dimmed,
                "fw-light": true,
              })}
            >
              {content}
            </span>
          );
        })}
      </h2>
      {desc}
      {chordSet === songRef && <ChordSetKeyboard close={closePiano} />}
    </div>
  );
}

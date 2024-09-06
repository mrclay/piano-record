import React, {
  CSSProperties,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Ops from "../Ops";
import { ActiveKeys, PianoActiveKeysListener, PianoEvents } from "../Piano";
import { RecorderCompleteListener, RecorderState } from "../Recorder";
import { atoms, useStore } from "../store";
import Keyboard from "../ui/Keyboard";
import PianoSpeed from "../ui/PianoSpeed";
import SongChords from "../ui/SongChords";
import { useCommonChordsQuery } from "./useCommonChordsQuery";
import { playSequence, sequenceFromStream } from "../Sequencer";

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

function ChordSetKeys({ close }: { close(): void }): JSX.Element {
  const [recorder] = useStore.recorder();
  const [sequencer] = useStore.sequencer();
  const piano = recorder.piano;
  const [activeKeys, setActiveKeys] = useState<ActiveKeys>(new Set());
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (sequencer) {
      sequencer.eventTarget.addEventListener("step", () => {
        const ak = sequencer?.getActiveKeys();
        if (ak) {
          setActiveKeys(ak);
        }
      });

      return;
    }

    piano.shepardMode = false;
    const keysListener: PianoActiveKeysListener = activeKeys => {
      setActiveKeys(activeKeys);
    };
    piano.addEventListener(PianoEvents.activeKeysChange, keysListener);

    const cc = document.querySelector<HTMLDivElement>(".CC");
    if (cc) {
      const margin = -cc.getBoundingClientRect().left;
      setStyle({
        marginLeft: `${margin}px`,
        marginRight: `${margin}px`,
      });
    }

    return () => {
      piano.removeEventListener(PianoEvents.activeKeysChange, keysListener);
    };
  }, [piano, sequencer]);

  return (
    <div style={style} className="my-5">
      <Keyboard activeKeys={activeKeys} />
      <div
        className="d-flex align-items-center my-0 mx-auto mt-2"
        style={{ width: "1246px" }}
      >
        <div>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={close}
          >
            Close <i className="fa fa-times" aria-hidden="true" />
          </button>
        </div>
        <PianoSpeed /> <SongChords />
      </div>
    </div>
  );
}

const isolateSong = (songUrl: string) => songUrl.split("/").pop();

interface ChordSetProps {
  els: Chord[];
}

interface ChordSetRef {
  song: string;
  songChords?: ReactNode;
}

export function ChordSet({ els }: ChordSetProps): JSX.Element {
  const ref = useRef<ChordSetRef>({ song: "" }).current;
  const { sevenths } = useCommonChordsQuery();

  const [chordSet, setChordSet] = useStore.chordSet();
  const [song, setSong] = useStore.song();
  ref.song = song;
  const [, setSongChords] = useStore.songChords();
  const [recorder] = useStore.recorder();
  const [sequencer, setSequencer] = useStore.sequencer();
  const [piano] = useStore.piano();
  const [pianoSpeed] = useStore.pianoSpeed();
  const [offset] = useStore.offset();

  useEffect(() => {
    const completeListener: RecorderCompleteListener = () => {
      setSong("");
    };
    recorder.addEventListener("complete", completeListener);

    return () => {
      recorder.removeEventListener("complete", completeListener);
    };
  }, [recorder, setSong, sequencer]);

  const closePiano = useCallback(() => {
    if (sequencer) {
      sequencer.stop();
      setSequencer(null);
    } else {
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
      const newSequence = playSequence({
        bpm,
        bps,
        stepData: newStepData,
        joinData: newJoinData,
        step: 0,
        piano,
      });
      setup = () => {
        setSequencer(newSequence);
        setTimeout(() => newSequence.start(), 100);
      };
    } else {
      const [, streamAndName] = chord.songUrl.split(
        /\/piano\/(?:songs|record)\//
      );
      stream = streamAndName.replace(/(\/|\?).*/, "");
      setup = () => {
        recorder.setOperations(Ops.operationsFromStream(stream, offset));
        recorder.play(pianoSpeed / 100);
      };
    }

    if (ref.song !== stream || chordSet !== ref) {
      sequencer?.stop();
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

  useEffect(() => {
    if (recorder.getState() === RecorderState.playing) {
      recorder.stop();
      recorder.play(pianoSpeed / 100);
    }
  }, [pianoSpeed, recorder]);

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
      {chordSet === ref && <ChordSetKeys close={closePiano} />}
    </>
  );
}

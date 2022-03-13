import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Ops from "../Ops";
import { ActiveKeys, PianoActiveKeysListener, PianoEvents } from "../Piano";
import {
  RecorderCompleteListener,
  RecorderEvent,
  RecorderState,
} from "../Recorder";
import { useStore } from "../store";
import Keyboard from "../ui/Keyboard";
import PianoSpeed from "../ui/PianoSpeed";
import { useCommonChordsQuery } from "./useCommonChordsQuery";

export interface Chord {
  func: string;
  root: string;
  type: string;
  bassNote: string;
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

function Keys(): JSX.Element {
  const [recorder] = useStore.recorder();
  const piano = recorder.piano;
  const [activeKeys, setActiveKeys] = useState<ActiveKeys>({});
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
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

    return () =>
      piano.removeEventListener(PianoEvents.activeKeysChange, keysListener);
  }, [piano]);

  return (
    <div style={style} className="keyWrapper">
      <Keyboard activeKeys={activeKeys} />
      <div>
        <PianoSpeed />
      </div>
    </div>
  );
}

interface ChordSetProps {
  els: Chord[];
}

export function ChordSet({ els }: ChordSetProps): JSX.Element {
  const ref = useRef({ song: "" }).current;
  const { relative, sevenths } = useCommonChordsQuery();

  const [chordSet, setChordSet] = useStore.chordSet();
  const [song, setSong] = useStore.song();
  ref.song = song;
  const [recorder] = useStore.recorder();
  const [pianoSpeed] = useStore.pianoSpeed();
  const [offset] = useStore.offset();

  useEffect(() => {
    const completeListener: RecorderCompleteListener = () => {
      setSong("");
    };
    recorder.addEventListener(RecorderEvent.complete, completeListener);

    return () => {
      recorder.removeEventListener(RecorderEvent.complete, completeListener);
    };
  }, []);

  const selectChord = useCallback<React.MouseEventHandler<HTMLAnchorElement>>(
    e => {
      e.preventDefault();
      const el = (e.target as HTMLElement).closest("a");
      if (el && el.href) {
        const [, streamAndName] = el.href.split(/\/piano\/(?:songs|record)\//);
        const stream = streamAndName.replace(/(\/|\?).*/, "");

        if (ref.song !== stream || chordSet !== ref) {
          ref.song = stream;
          setChordSet(ref);
          setSong(stream);
          recorder.setOperations(Ops.operationsFromStream(stream, offset));
          recorder.play(pianoSpeed / 100);
        } else {
          recorder.stop();
          setChordSet({});
          setSong("");
        }
      }
    },
    [offset, pianoSpeed]
  );

  useEffect(() => {
    if (recorder.getState() === RecorderState.playing) {
      recorder.stop();
      recorder.play(pianoSpeed / 100);
    }
  }, [pianoSpeed]);

  return (
    <>
      <h2 className="chordSet">
        {els.map((el, i) => {
          const [func1, func2 = ""] = el.func.split("/");

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
              {relative && (
                <span>
                  <span className="func">{func1}</span>
                  {type !== "" && (
                    <span className="qual">
                      {type.replace(/^m(7|$)/, "$1")}
                    </span>
                  )}
                  {func2 !== "" && <span className="func">/{func2}</span>}
                </span>
              )}
            </>
          );

          const elKey = Object.values(el).join() + type;
          return el.songUrl ? (
            <a
              key={elKey + "but"}
              href={el.songUrl}
              target="_blank"
              rel="noreferrer"
              onClick={e => selectChord(e)}
            >
              {content}
            </a>
          ) : (
            <span key={elKey}>{content}</span>
          );
        })}
      </h2>
      {chordSet === ref && <Keys />}
    </>
  );
}

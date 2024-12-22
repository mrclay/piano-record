import { useSearchParams } from "react-router-dom";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { escape } from "html-escaper";
import { useStore } from "../store";
import Keyboard from "../ui/Keyboard";
import Play from "../ui/BigPlay";
import { sequenceFromStream } from "../Sequencer";
import Ops, { TimedOp } from "../Ops";
import * as C from "../constants";
import { ActiveKeys } from "../Piano";

const isolateSong = (songUrl: string) => songUrl.split("/").pop();

export default function EmbedPage(): JSX.Element {
  const [url, setUrl] = useState(
    "https://mrclay.org/sequence/songs/v4,100,1,p2dp45p38p3dp40-j2dp47j38j3dj40-p2bp49p36p3bp3e-j2bp4aj36j3bj3e-p4cp2ep39p3ep35-p51j2ej39j3ej35-p4ep37p3bp40p30-j4ej37j3bj40j30-p26p39p3dp42p4c-j26j39j3dj42p4e-p26j39j3dj42p49-j26j39j3dj42j49-p2bp3bp3ep42p47-p49j3bj3ej42j2b-p45j3bj3ej42p2b-j45j3bj3ej42j2b",
  );
  const [searchParams] = useSearchParams();
  const test = Boolean(searchParams.get("test"));
  const [sequencer] = useStore.sequencer();
  const [recorder] = useStore.recorder();
  const [piano] = useStore.piano();
  const [song, setSong] = useStore.song();
  const [chordOps, setChordOps] = useState<TimedOp[] | null>(null);
  const [activeKeys, setActiveKeys] = useState<ActiveKeys | null>(null);
  const songRef = useRef({ song: "" }).current;
  songRef.song = song;

  useEffect(() => {
    if (!test) {
      document.body.classList.add("embed-page");
      return () => document.body.classList.remove("embed-page");
    }
  }, []);

  useEffect(() => {
    const newUrl = searchParams.get("url") || "";
    setUrl(prev => newUrl || prev);

    if (newUrl.includes("/chord/")) {
      const notes = newUrl
        .split("/chord/")[1]
        .split("/")[0]
        .split(",")
        .map(Number);
      const timedOps = [
        ...notes.map(midi => [[C.OP_NOTE_DOWN, midi], 0] satisfies TimedOp),
        ...notes.map(
          midi =>
            [
              [C.OP_NOTE_UP, midi],
              5e3 / C.TIME_RESOLUTION_DIVISOR,
            ] satisfies TimedOp,
        ),
      ];
      setActiveKeys(new Set(notes));
      setChordOps(timedOps);
    } else {
      setActiveKeys(null);
      setChordOps(null);
    }

    sequencer.stop();
    recorder.stop();
  }, [searchParams]);

  const iframeUrl = `http://localhost:5173/embed?${new URLSearchParams({ url })}`;
  const embedHtml = `<iframe src="${escape(iframeUrl)}" height="100" width="600" style="width:100%"></iframe>`;

  const play = () => {
    if (!url) {
      return;
    }

    let stream = "";
    let setup;
    const offset = 0;

    if (chordOps) {
      stream = "arbitrary";

      setup = () => {
        recorder.setOperations(chordOps);
        recorder.repeatAfterMs = 100;
        recorder.play();
      };
    } else if (url.includes("/sequence/songs/")) {
      stream = isolateSong(url) || "";
      const { bpm, bps, newStepData, newJoinData } = sequenceFromStream(
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
      setup = () => {
        setTimeout(() => sequencer.start(), 100);
      };
    } else {
      const [, streamAndName] = url.split(/\/piano\/(?:songs|record)\//);
      stream = streamAndName.replace(/(\/|\?).*/, "");
      setup = () => {
        recorder.setOperations(Ops.operationsFromStream(stream, offset));
        recorder.repeatAfterMs = 1e3;
        recorder.play();
      };
    }

    sequencer.stop();
    recorder.stop();

    setSong(stream);
    setup();
  };

  const stop = useCallback(() => {
    if (sequencer.isPlaying()) {
      sequencer.stop();
    } else {
      recorder.repeatAfterMs = null;
      recorder.stop();
    }

    setSong("");
  }, [sequencer, recorder]);

  return (
    <div>
      {!test && (
        <div className="d-flex">
          <div className="flex-shrink-1 text-center">
            <Play
              handlePlay={play}
              handleStop={stop}
              isPlaying={song !== ""}
              isWaiting={false}
              progress={0}
            />

            <a
              href={url}
              target="_blank"
              className="mt-3 d-inline-block"
              title="Open in new tab"
              onClick={stop}
            >
              <i
                className="fa fa-external-link"
                aria-hidden="true"
                aria-label="Load in new tab"
              />
            </a>
          </div>
          <div>
            <div style={{ transform: "scale(0.62)", transformOrigin: "0 0" }}>
              <Keyboard
                activeKeys={activeKeys || undefined}
                piano={activeKeys ? undefined : piano}
              />
            </div>
          </div>
        </div>
      )}
      {test && (
        <div>
          <div style={{ border: "1px solid magenta", marginBottom: "2rem" }}>
            <iframe
              src={iframeUrl}
              height="120"
              width="600"
              style={{ width: "100%", verticalAlign: "bottom" }}
            ></iframe>
          </div>
          <table className="table">
            <tbody>
              <tr>
                <th style={{ width: "1px" }}>Song&nbsp;URL</th>
                <td>
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.currentTarget.value)}
                    style={{ width: "100%" }}
                    onClick={e => e.currentTarget.select()}
                  />
                </td>
              </tr>
              <tr>
                <th>Embed&nbsp;URL</th>
                <td>
                  <textarea
                    value={iframeUrl}
                    readOnly
                    style={{ width: "100%" }}
                    onClick={e => e.currentTarget.select()}
                  />
                </td>
              </tr>
              <tr>
                <th>Embed&nbsp;HTML</th>
                <td>
                  <textarea
                    value={embedHtml}
                    readOnly
                    style={{ width: "100%" }}
                    onClick={e => e.currentTarget.select()}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

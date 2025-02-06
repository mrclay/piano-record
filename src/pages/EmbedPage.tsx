import { useSearchParams } from "react-router-dom";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { escape } from "html-escaper";

import { useStore } from "../store";
import Keyboard from "../ui/Keyboard";
import Play from "../ui/BigPlay";
import { sequenceFromStream } from "../Sequencer";
import Ops, { TimedOp } from "../Ops";
import * as C from "../constants";
import { ActiveKeys } from "../Piano";

const isolateSong = (songUrl: string) => songUrl.split("/").pop();

export default function EmbedPage(): ReactNode {
  const [url, setUrl] = useState("");
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
  const { iframeUrl, embedHtml } = getEmbedUrl(url);

  const [lowestNote, setLowestNote] = useState(0);
  const keysLeftMargin = lowestNote
    ? Math.max(
        -300,
        Math.min(0, -((lowestNote - 3 - C.RANGE[0]) * (32 * 7)) / 12),
      )
    : 0;

  useEffect(() => {
    if (!test) {
      document.body.classList.add("embed-page");
      return () => document.body.classList.remove("embed-page");
    }
  }, []);

  useEffect(() => {
    const newUrl = searchParams.get("url") || "";
    setUrl(prev => newUrl || prev);

    setActiveKeys(null);
    setChordOps(null);

    if (newUrl.includes("/chord/")) {
      const notes = newUrl
        .split("/chord/")[1]!
        .split("/")[0]!
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
      setLowestNote(Math.min(...notes));
    } else if (newUrl.includes("/sequence/songs/")) {
      const { newStepData } = sequenceFromStream(isolateSong(newUrl) || "", 0);

      let lowestNote = C.RANGE[1];
      (newStepData || null)?.forEach(step =>
        step.forEach(note => {
          lowestNote = Math.min(lowestNote, note);
        }),
      );
      setLowestNote(lowestNote);
    } else if (newUrl.includes("/sequence/songs/")) {
      const [, streamAndName = ""] = url.split(/\/piano\/(?:songs|record)\//);
      const stream = streamAndName.replace(/(\/|\?).*/, "");
      const ops = Ops.operationsFromStream(stream, 0);

      let lowestNote = C.RANGE[1];
      ops.forEach(timedOp => {
        lowestNote = Math.min(lowestNote, timedOp[0]![1]!);
      });
      setLowestNote(lowestNote);
    }

    sequencer.stop();
    recorder.stop();
  }, [searchParams]);

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
      setup = () => {
        setTimeout(() => sequencer.start(), 100);
      };
    } else {
      const [, streamAndName = ""] = url.split(/\/piano\/(?:songs|record)\//);
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
          <div className="flex-shrink-1 text-center pe-3">
            <Play
              handlePlay={play}
              handleStop={stop}
              isPlaying={song !== ""}
              isWaiting={false}
              progress={0}
            />

            <div>
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
          </div>
          <div>
            <div
              style={{
                flex: 1,
                transform: "scale(0.62)",
                transformOrigin: "0 0",
                overflow: "hidden",
              }}
            >
              <div style={{ marginLeft: `${keysLeftMargin}px` }}>
                <Keyboard
                  activeKeys={activeKeys || undefined}
                  piano={activeKeys ? undefined : piano}
                />
              </div>
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
                <td className="font-monospace">{iframeUrl}</td>
              </tr>
              <tr>
                <th>Embed&nbsp;HTML</th>
                <td className="font-monospace">{embedHtml}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function getEmbedUrl(url: string) {
  const iframeUrl =
    window.origin + `/piano/embed?${new URLSearchParams([["url", url]])}`;
  const embedHtml = `<iframe src="${escape(iframeUrl)}" height="120" width="600" style="border:0; width:100%"></iframe>`;

  return { iframeUrl, embedHtml };
}

import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import * as Tone from "tone";

import BigPlay from "../ui/BigPlay";
import Keyboard from "../ui/Keyboard";
import Ops from "../Ops";
import Paths from "../Paths";
import Piano from "../Piano";
import Template from "./Template";
import Title from "../ui/Title";
import Saver from "../ui/Saver";

interface MatchItems {
  notes?: string;
  title?: string;
}

type Action = "stop" | "play" | "setTitle";

const example = Paths.chordPrefix("/43,56,60,62,65/G7b9sus");

export default function ChordPage() {
  const pianoRef = useRef<Piano | null>(null);
  if (!pianoRef.current) {
    pianoRef.current = new Piano();
  }
  const piano = pianoRef.current;

  const timeout = useRef<number | null>(null);

  const navigate = useNavigate();
  const params: MatchItems = useParams();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const transpose = searchParams.get("transpose") || "0";

  const [activeKeys, setActiveKeys] = useState(Piano.getActiveKeys());
  const [title, setTitle] = useState("");
  const [action, setAction] = useState<Action>("stop");

  const activeKeysRef = useRef(activeKeys);
  activeKeysRef.current = activeKeys;

  useEffect(() => {
    document.title = "Simple Chord";
    piano.addEventListener("reset", reset);

    return () => {
      piano.removeEventListener("reset", reset);
    };
  }, []);

  useEffect(() => {
    const { notes, title } = params;
    const initActiveKeys = Piano.getActiveKeys();
    const offset = parseInt(transpose || "0");

    const notesArr = notes ? notes.split(",") : [];
    notesArr.forEach(note => {
      initActiveKeys[parseInt(note) + offset] = true;
    });

    setActiveKeys(initActiveKeys);
    setTitle(decodeURIComponent(title || ""));
    setAction("stop");
  }, [params, transpose]);

  // Handle key/action changes
  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    piano.stopAll();

    if (action === "setTitle") {
      save(null, true);
      setAction("stop");
      return;
    }

    if (action === "play") {
      Object.entries(activeKeys).forEach(([note, value]) => {
        if (value) {
          piano.startNote(Number(note));
        }
      });

      timeout.current = window.setTimeout(() => {
        setAction("stop");
      }, 5000);
    }
  }, [action, activeKeys]);

  function handlePlay() {
    // Hack to directly tie a keypress to sound generation so the WebAudio API
    // will allow sound on the page.
    const sine = new Tone.Oscillator(60, "sine").toDestination();
    sine.volume.value = -60;
    sine.start();
    sine.stop();

    setAction("play");
  }

  const save = useCallback(
    (e: MouseEvent<HTMLButtonElement> | null, replaceUrl = false) => {
      let notes: number[] = [];
      Object.entries(activeKeys).forEach(([note, value]) => {
        if (value) {
          notes.push(Number(note));
        }
      });

      if (!notes.length) {
        return;
      }

      let path = notes.join(",");
      if (title) {
        path += "/" + Ops.fixedEncodeURIComponent(title);
      }

      navigate(Paths.chordPrefix(path), {
        replace: replaceUrl,
      });
    },
    [activeKeys, title]
  );

  const reset = () => {
    setAction("stop");
    piano.stopAll();
    setActiveKeys(Piano.getActiveKeys());
    setTitle("");
    navigate(Paths.chordPrefix("/"));
  };

  const handleTitleSet = (title: string) => {
    setTitle(title.trim());
    setAction("setTitle");
  };

  const onKeyClick = useCallback((note: number) => {
    setAction("play");
    setActiveKeys(activeKeys => ({
      ...activeKeys,
      [note]: !activeKeys[note],
    }));
  }, []);

  if (window.location.hash) {
    // legacy URLs
    const m = window.location.hash.match(/n=([\d,]+)(?:&c=(.*))?/);
    if (m) {
      const path = m[2] ? `/${m[1]}/${m[2]}` : `/${m[1]}`;

      return <Navigate to={Paths.chordPrefix(path)} />;
    }
  }

  return (
    <Template
      title="Chord"
      intro={
        <p>
          Wanna capture a <Link to={example}>chord</Link> or share it with
          others? Tap some notes or play your MIDI keyboard (Chrome only), and
          click <i>Save</i>. You can share the resulting page URL or bookmark
          it.
        </p>
      }
    >
      <section>
        <div>
          <BigPlay
            isPlaying={action === "play"}
            handlePlay={handlePlay}
            handleStop={() => setAction("stop")}
            progress={0}
            isWaiting={false}
          />
          <Title title={title} onChange={handleTitleSet} />
          {!title && "(click to rename)"}
          <button
            type="button"
            onClick={save}
            id="save"
            className="btn btn-primary med-btn"
            style={{ marginLeft: "1em" }}
          >
            <i className="fa fa-floppy-o" aria-hidden="true" />{" "}
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={reset}
            id="reset"
            className="btn btn-danger med-btn"
          >
            <i className="fa fa-trash" aria-label="Reset" />
          </button>
        </div>
      </section>
      <Keyboard
        key={pathname}
        activeKeys={activeKeys}
        onKeyClick={onKeyClick}
      />
      {params.notes && (
        <section>
          <h3>Share it</h3>
          <p>
            Copy to clipboard:{" "}
            <Saver href={window.location.href} title={title} />
          </p>
        </section>
      )}
    </Template>
  );
}

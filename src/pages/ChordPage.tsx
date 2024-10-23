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
  useSearchParams,
} from "react-router-dom";
import * as Tone from "tone";
import Head from "@uiw/react-head";

import BigPlay from "../ui/BigPlay";
import Keyboard from "../ui/Keyboard";
import Ops from "../Ops";
import Paths from "../Paths";
import { ActiveKeys } from "../Piano";
import Title from "../ui/Title";
import Saver from "../ui/Saver";
import PianoShepardMode from "../ui/PianoShepardMode";
import { useStore } from "../store";
import SoundSelector, { useSfStorage } from "../ui/SoundSelector";
import {
  Container900,
  Content900,
  H1,
  HeadingNav,
  HrFinal,
} from "../ui/Common";

interface MatchItems {
  notes?: string;
  title?: string;
}

type Action = "stop" | "play" | "setTitle";

const example = Paths.chordPrefix("/43,56,60,62,65/G7b9sus");
// http://localhost:5173/chord/69,47,82,60?sf=Mellotron.mk2_flute

export default function ChordPage() {
  const [piano] = useStore.piano();
  const { saveSf } = useSfStorage();

  const timeout = useRef<number | null>(null);

  const navigate = useNavigate();
  const params: MatchItems = useParams();
  const [searchParams] = useSearchParams();
  const transpose = searchParams.get("transpose") || "0";

  const [activeKeys, setActiveKeys] = useState<ActiveKeys>(new Set());
  const [title, setTitle] = useState("");
  const [action, setAction] = useState<Action>("stop");

  const activeKeysRef = useRef(activeKeys);
  activeKeysRef.current = activeKeys;

  const reset = useCallback(() => {
    setAction("stop");
    piano.stopAll();
    setActiveKeys(new Set());
    setTitle("");
    navigate(Paths.chordPrefix("/"));
  }, [navigate, piano]);

  const handleTitleSet = (title: string) => {
    setTitle(title.trim());
    setAction("setTitle");
  };

  const onKeyClick = useCallback((note: number) => {
    setAction("play");
    setActiveKeys(set => {
      const ret = new Set(set);
      ret[ret.has(note) ? "delete" : "add"](note);
      return ret;
    });
  }, []);

  async function handlePlay() {
    await Tone.start();
    setAction("play");
  }

  const save = useCallback(
    (e: MouseEvent<HTMLButtonElement> | null, replaceUrl = false) => {
      let notes: number[] = [];
      notes.push(...activeKeys.values());

      if (!notes.length) {
        return;
      }

      let path = notes.join(",");
      if (title) {
        path += "/" + Ops.fixedEncodeURIComponent(title);
      }

      const url = Paths.chordPrefix(path) + `?${saveSf()}`;
      navigate(url, {
        replace: replaceUrl,
      });
    },
    [activeKeys, navigate, title]
  );

  useEffect(() => {
    piano.addEventListener("reset", reset);

    return () => {
      piano.removeEventListener("reset", reset);
    };
  }, [piano, reset]);

  useEffect(() => {
    const { notes, title } = params;
    const initActiveKeys = new Set(piano.activeKeys);
    const offset = parseInt(transpose || "0");

    const notesArr = notes ? notes.split(",") : [];
    notesArr.forEach(note => {
      initActiveKeys.add(parseInt(note) + offset);
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
      activeKeys.forEach(note => piano.startNote(note));

      timeout.current = window.setTimeout(() => {
        setAction("stop");
      }, 5000);
    }
  }, [action, activeKeys, piano, save]);

  if (window.location.hash) {
    // legacy URLs
    const m = window.location.hash.match(/n=([\d,]+)(?:&c=(.*))?/);
    if (m) {
      const path = m[2] ? `/${m[1]}/${m[2]}` : `/${m[1]}`;

      return <Navigate to={Paths.chordPrefix(path)} />;
    }
  }

  return (
    <div>
      <HeadingNav />

      <Content900>
        <div className="d-flex justify-content-between">
          <H1>Chord</H1>
          <Head>
            <Head.Title>Simple Chord : mrclay.org</Head.Title>
          </Head>

          <button
            type="button"
            onClick={reset}
            id="reset"
            className="btn btn-lg btn-link text-danger text-decoration-none"
          >
            <i className="fa fa-trash" aria-label="Reset" /> New
          </button>
        </div>

        <p>
          Wanna capture a <Link to={example}>chord</Link> or share it with
          others? Tap some notes or play your MIDI keyboard (Chrome only), and
          click <i>Save</i>. You can share the resulting page URL or bookmark
          it.
        </p>
      </Content900>

      <Keyboard activeKeys={activeKeys} onKeyClick={onKeyClick} />

      <Container900 className="mt-3">
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
          <i className="fa fa-floppy-o" aria-hidden="true" /> <span>Save</span>
        </button>
      </Container900>

      <Content900>
        <SoundSelector />
      </Content900>

      <Content900>
        {params.notes && (
          <section>
            <h3>Share it</h3>
            <p>
              Copy to clipboard:{" "}
              <Saver href={window.location.href} title={title} />
            </p>
          </section>
        )}
      </Content900>

      <HrFinal />
    </div>
  );
}

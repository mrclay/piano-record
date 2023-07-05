import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import * as C from "../constants";
import Keyboard from "../ui/Keyboard";
import Ops, { TimedOp } from "../Ops";
import Paths from "../Paths";
import Piano, {
  ActiveKeys,
  PianoActiveKeysListener,
  PianoEvents,
} from "../Piano";
import Recorder, {
  RecorderEvent,
  RecorderProgressListener,
  RecorderState,
} from "../Recorder";
import Title from "../ui/Title";
import Preview from "../ui/Preview";
import Saver from "../ui/Saver";
import PianoSpeed from "../ui/PianoSpeed";
import { useStore } from "../store";
import PianoShepardMode from "../ui/PianoShepardMode";
import SoundSelector, { UseSfStorage, useSfStorage } from "../ui/SoundSelector";
import {
  Container900,
  Content900,
  H1,
  HeadingNav,
  HrFinal,
} from "../ui/Common";

enum Mode {
  recording = "recording",
  oneKey = "oneKey",
  shared = "shared",
}

interface MatchItems {
  stream?: string;
  title?: string;
}

const example = Paths.pianoPrefix(
  "/songs/C320C3c30C3e3bC423hC454bD3c8gC448uC3b8xD4299D459cC40eaC3aedD44elD" +
    "3berD3ejnC42l8D3al9C39laD40lhD39ohC40oiC38oiD42p5C3eqtD40quC37tgD38thC" +
    "40tlD3eu1C42wnD40x3D3713nC3613zC3e144D4214cD3e1fuD361gaD321gf/Hello%20World"
);

function notesFromOps(ops: TimedOp[]) {
  return ops
    .filter(([midiNote]) => midiNote[0] === C.OP_NOTE_DOWN)
    .map(([midiNote]) => midiNote[1]);
}

function stateFromProps(
  params: MatchItems,
  pathname: string,
  piano: Piano,
  transpose = "0",
  recorder: Recorder
) {
  const stream = params.stream || "";
  const title = params.title ? decodeURIComponent(params.title) : "";
  const offset = parseInt(transpose);
  const ops = Ops.operationsFromStream(stream, offset);

  if (recorder) {
    recorder.setOperations(ops);
  }

  if (!ops.length) {
    recorder.startRecording();
  }

  let mode = Mode.recording;
  if (ops.length && pathname.indexOf("/piano/songs/") === 0) {
    mode = Mode.shared;
  }

  return {
    stream,
    title,
    activeKeys: new Set(piano.activeKeys),
    mode,
    progress: 0,
  };
}

export default function PianoPage() {
  const sfStorage = useSfStorage();
  const navigate = useNavigate();
  const params: MatchItems = useParams();
  const { pathname } = useLocation();
  const [piano] = useStore.piano();
  const [pianoSpeed] = useStore.pianoSpeed();

  const recorder = useMemo(() => new Recorder({ piano }), [piano]);
  const [searchParams] = useSearchParams();
  const transpose = searchParams.get("transpose") || "0";

  const initial = useMemo(
    () => stateFromProps(params, pathname, piano, transpose, recorder),
    []
  );

  const [activeKeys, setActiveKeys] = useState<ActiveKeys>(initial.activeKeys);
  const [progress, setProgress] = useState(initial.progress);
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [stream, setStream] = useState(initial.stream);
  const [title, setTitle] = useState(initial.title);

  const thiss = useRef({
    // Holds which key(s) are being used to play a particular note
    notesByKey: Object.create(null) as Record<string, number>,
    // All notes in striking order (release order not considered)
    notes: notesFromOps(recorder.getOperations()),
    // In one-key mode, index of the next notes value
    notesIndex: 0,
  }).current;

  const onKeyClick = (note: number) => recorder.clickNote(note);

  const oneKeyPlay = useCallback((e: KeyboardEvent) => {
    const { type, repeat, keyCode } = e;

    if (repeat || keyCode < 65 || keyCode > 90) {
      return;
    }

    if (type === "keyup") {
      const note = thiss.notesByKey[keyCode];
      if (typeof note === "number") {
        delete thiss.notesByKey[keyCode];
        piano.stopNote(note);
      }
    } else if (type === "keydown") {
      // When holding multiple keys, linux occasionally fires a 2nd keydown
      // event (with repeat === false) just before triggering keyup, so just
      // ignore keydown when we "know" the key is already down.
      if (typeof thiss.notesByKey[keyCode] !== "undefined") {
        return;
      }

      if (thiss.notesIndex >= thiss.notes.length) {
        // We've already exhausted our queued notes
        return;
      }

      const note = thiss.notes[thiss.notesIndex];
      thiss.notesByKey[keyCode] = note;
      piano.startNote(note);
      thiss.notesIndex++;
    }
  }, []);

  const play = () => recorder.play(pianoSpeed / 100);

  const stop = () => recorder.stop();

  const save = () => {
    recorder.stop();
    setMode(Mode.recording);

    const stream = Ops.streamFromOperations(recorder.getOperations());
    const params = sfStorage.saveSf();
    if (stream) {
      navigate(Paths.pianoPrefix(`/record/${stream}?${params}`));
    }
  };

  const share = () => {
    recorder.stop();
    const stream = Ops.streamFromOperations(recorder.getOperations());
    const params = sfStorage.saveSf();
    navigate(Paths.pianoPrefix(`/songs/${stream}?${params}`));
  };

  const reset = () => {
    recorder.startRecording();
    setMode(Mode.recording);
    navigate(Paths.pianoPrefix("/record"));
  };

  const updateTitle = (rawTitle: string) => {
    setTitle(rawTitle.trim());

    const t = Ops.fixedEncodeURIComponent(rawTitle.trim());
    const params = sfStorage.saveSf();

    navigate(Paths.pianoPrefix(`/songs/${stream}/${t}?${params}`), {
      replace: true,
    });
  };

  const makeChanges = () => {
    setMode(Mode.recording);
    const stream = Ops.streamFromOperations(recorder.getOperations());
    const params = sfStorage.saveSf();
    navigate(Paths.pianoPrefix(`/record/${stream}?${params}`));
  };

  const recordMore = () => {
    recorder.restartRecording();
    setMode(Mode.recording);
  };

  const startOneKey = () => {
    thiss.notesIndex = 0;
    thiss.notesByKey = Object.create(null);
    const ops =
      mode === Mode.oneKey
        ? recorder.getLastOperations()
        : recorder.getOperations();

    thiss.notes = notesFromOps(ops);
    recorder.startRecording();
    setMode(Mode.oneKey);
  };

  useEffect(() => {
    // legacy URLs
    if (window.location.hash) {
      const m = window.location.hash.match(/s=(\w+)(?:&t=(.*))?/);
      if (m) {
        const path = m[2] ? `/songs/${m[1]}/${m[2]}` : `/songs/${m[1]}`;
        setTimeout(() => {
          // React router picky about how soon navigate is called
          navigate(Paths.pianoPrefix(path));
        }, 1);
        return;
      }
    }

    document.title = "Simple Piano";

    const progressListener: RecorderProgressListener = progress =>
      setProgress(progress);
    recorder.addEventListener(RecorderEvent.progress, progressListener);

    const keysChangeListener: PianoActiveKeysListener = activeKeys =>
      setActiveKeys(activeKeys);
    piano.addEventListener(PianoEvents.activeKeysChange, keysChangeListener);
    piano.addEventListener(PianoEvents.reset, reset);

    document.addEventListener("keydown", oneKeyPlay);
    document.addEventListener("keyup", oneKeyPlay);

    return () => {
      recorder.removeEventListener(RecorderEvent.progress, progressListener);
      piano.removeEventListener(
        PianoEvents.activeKeysChange,
        keysChangeListener
      );

      document.removeEventListener("keydown", oneKeyPlay);
      document.removeEventListener("keyup", oneKeyPlay);
    };
  }, []);

  // Render
  const recorderState = recorder.getState();
  const hasOperations = Boolean(recorder.operations.length);
  const hasStream = Boolean(stream);

  const canSave =
    (recorderState === RecorderState.recording && hasOperations) ||
    mode === Mode.oneKey;
  const canMakeChanges = mode === Mode.shared;
  const canOneKey =
    (mode === Mode.recording && hasStream) || mode === Mode.oneKey;
  const canShare =
    mode !== Mode.shared &&
    recorderState === RecorderState.stopped &&
    hasOperations;
  const canRecordMore = !canMakeChanges && hasOperations;

  return (
    <>
      <HeadingNav />

      <Content900>
        <div className="d-flex justify-content-between">
          <H1>Melody</H1>

          <button
            type="button"
            onClick={reset}
            id="reset"
            className="btn btn-lg btn-link text-danger text-decoration-none"
          >
            <i className="fa fa-trash" aria-label="Start over" /> New
          </button>
        </div>

        <p>
          Wanna capture a <Link to={example}>short musical idea</Link> or share
          it with others? Tap some notes or play your MIDI keyboard (Chrome
          only), and click <i>Save</i>. You can share the resulting page URL or
          bookmark it.
        </p>
      </Content900>

      <Keyboard
        activeKeys={activeKeys}
        onKeyClick={mode === Mode.recording ? onKeyClick : undefined}
      />
      <PianoSpeed />

      <Container900 className="mt-3">
        <div>
          {mode === Mode.shared && (
            <span className="title-ui">
              <Title title={title} onChange={updateTitle} />
              {!title && " (click to rename)"}
            </span>
          )}

          {hasOperations ? (
            <Preview
              handlePlay={play}
              handleStop={stop}
              isPlaying={progress !== 0}
              isWaiting={false}
              progress={{ ratio: progress }}
            />
          ) : (
            <div className="pt-5" />
          )}

          {canMakeChanges && (
            <button
              type="button"
              className="btn btn-warning med-btn"
              onClick={makeChanges}
            >
              <i className="fa fa-wrench" aria-hidden="true" />{" "}
              <span>Make changes</span>
            </button>
          )}

          {canRecordMore && (
            <button
              type="button"
              className="btn btn-warning med-btn"
              onClick={recordMore}
            >
              <i className="fa fa-circle" aria-hidden="true" />{" "}
              <span>Record more</span>
            </button>
          )}

          {canOneKey && (
            <button
              type="button"
              id="oneKeyPlay"
              className="btn btn-warning med-btn"
              title="hint: use your keyboard"
              onClick={startOneKey}
            >
              <i className="fa fa-clock-o" aria-hidden="true" />{" "}
              <span>Fix the timing</span>
            </button>
          )}

          {canSave && (
            <button
              type="button"
              onClick={save}
              className="btn btn-primary med-btn"
            >
              <i className="fa fa-save" aria-hidden="true" /> <span>Save</span>
            </button>
          )}

          {canShare ? (
            <button
              type="button"
              onClick={share}
              className="btn btn-primary med-btn"
            >
              <i className="fa fa-save" aria-hidden="true" /> <span>Share</span>
            </button>
          ) : null}
        </div>
      </Container900>

      <Content900>
        <SoundSelector />
        <PianoShepardMode piano={piano} />
      </Content900>

      <Content900>
        {mode === Mode.shared && (
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
    </>
  );
}

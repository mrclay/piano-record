import React from "react";
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
import Template from "./Template";
import Title from "../ui/Title";
import Preview from "../ui/Preview";
import Saver from "../ui/Saver";
import Status from "../ui/Status";
import PianoSpeed from "../ui/PianoSpeed";
import { useStore } from "../store";
import { BottomRightAd } from "../ui/Ads";

enum Mode {
  recording = "recording",
  oneKey = "oneKey",
  shared = "shared",
}

interface MatchItems {
  stream?: string;
  title?: string;
}

interface PianoPageProps extends C.RouteComponentProps<MatchItems> {
  pianoSpeed: number;
}

interface PianoPageState {
  activeKeys: ActiveKeys;
  progress: number;
  mode: Mode;
  stream: string;
  title: string;
  undoStream: string;
  shepardMode: boolean;
}

export default function Wrapper() {
  const navigate = useNavigate();
  const params: MatchItems = useParams();
  const { pathname } = useLocation();

  const [searchParams] = useSearchParams();
  const [pianoSpeed] = useStore.pianoSpeed();
  return (
    <PianoPage
      key={pathname}
      pathname={pathname}
      navigate={navigate}
      params={params}
      pianoSpeed={pianoSpeed}
      transpose={searchParams.get("transpose") || "0"}
    />
  );
}

const example = Paths.pianoPrefix(
  "/songs/C320C3c30C3e3bC423hC454bD3c8gC448uC3b8xD4299D459cC40eaC3aedD44elD" +
    "3berD3ejnC42l8D3al9C39laD40lhD39ohC40oiC38oiD42p5C3eqtD40quC37tgD38thC" +
    "40tlD3eu1C42wnD40x3D3713nC3613zC3e144D4214cD3e1fuD361gaD321gf/Hello%20World"
);

class PianoPage extends React.Component<PianoPageProps, PianoPageState> {
  // Holds which key(s) are being used to play a particular note
  notesByKey: Record<string, number>;
  // All notes in striking order (release order not considered)
  notes: number[];
  // In one-key mode, index of the next notes value
  notesIndex: number;
  recorder: Recorder;

  constructor(props: PianoPageProps) {
    super(props);

    this.recorder = new Recorder();
    this.state = PianoPage.stateFromProps(props, this.recorder);
    this.notes = PianoPage.notesFromOps(this.recorder.getOperations());
    this.notesIndex = 0;
    this.notesByKey = Object.create(null);
  }

  static notesFromOps(ops: TimedOp[]) {
    return ops
      .filter(([midiNote]) => midiNote[0] === C.OP_NOTE_DOWN)
      .map(([midiNote]) => midiNote[1]);
  }

  static stateFromProps(
    { params, pathname, transpose }: PianoPageProps,
    recorder: Recorder
  ): PianoPageState {
    const stream = params.stream || "";
    const title = params.title ? decodeURIComponent(params.title) : "";
    const offset = parseInt(transpose || "0");
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
      activeKeys: Piano.getActiveKeys(),
      mode,
      progress: 0,
      undoStream: "",
      shepardMode: false,
    };
  }

  componentDidMount() {
    // legacy URLs
    if (window.location.hash) {
      const m = window.location.hash.match(/s=(\w+)(?:&t=(.*))?/);
      if (m) {
        const path = m[2] ? `/songs/${m[1]}/${m[2]}` : `/songs/${m[1]}`;
        setTimeout(() => {
          // React router picky about how soon navigate is called
          this.props.navigate(Paths.pianoPrefix(path));
        }, 1);
        return;
      }
    }

    document.title = "Simple Piano";
    //this.recorder.addEventListener(RecorderEvent.state, this.onRecorderState);
    this.recorder.addEventListener(
      RecorderEvent.progress,
      this.onRecorderProgress
    );
    const piano = this.recorder.getPiano();
    piano.addEventListener(
      PianoEvents.activeKeysChange,
      this.onActiveKeysChange
    );
    piano.addEventListener(PianoEvents.reset, this.reset);
    document.addEventListener("keydown", this.oneKeyPlay);
    document.addEventListener("keyup", this.oneKeyPlay);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.oneKeyPlay);
    document.removeEventListener("keyup", this.oneKeyPlay);
  }

  componentDidUpdate(
    prevProps: Readonly<PianoPageProps>,
    prevState: Readonly<PianoPageState>,
    snapshot?: any
  ) {
    this.recorder.piano.shepardMode = this.state.shepardMode;
  }

  onRecorderProgress: RecorderProgressListener = progress => {
    this.setState({ progress });
  };

  onActiveKeysChange: PianoActiveKeysListener = activeKeys => {
    this.setState({ activeKeys });
  };

  play = () => {
    this.recorder.play(this.props.pianoSpeed / 100);
  };

  stop = () => {
    this.recorder.stop();
  };

  save = () => {
    this.recorder.stop();
    this.setState({ mode: Mode.recording }, () => {
      const stream = Ops.streamFromOperations(this.recorder.getOperations());
      if (stream) {
        this.props.navigate(Paths.pianoPrefix(`/record/${stream}`));
      }
    });
  };

  share = () => {
    this.recorder.stop();
    const stream = Ops.streamFromOperations(this.recorder.getOperations());
    this.props.navigate(Paths.pianoPrefix(`/songs/${stream}`));
  };

  reset = () => {
    this.recorder.startRecording();
    this.setState({ mode: Mode.recording }, () => {
      this.props.navigate(Paths.pianoPrefix("/record"));
    });
  };

  setTitle = (rawTitle: string) => {
    const title = rawTitle.trim();

    this.setState({ title }, () => {
      const s = this.state.stream;
      const t = Ops.fixedEncodeURIComponent(title);

      this.props.navigate(Paths.pianoPrefix(`/songs/${s}/${t}`), {
        replace: true,
      });
    });
  };

  makeChanges = () => {
    this.setState({ mode: Mode.recording });
    const stream = Ops.streamFromOperations(this.recorder.getOperations());
    this.props.navigate(Paths.pianoPrefix(`/record/${stream}`));
  };

  recordMore = () => {
    this.recorder.restartRecording();
    this.setState({ mode: Mode.recording });
  };

  startOneKey = () => {
    this.notesIndex = 0;
    this.notesByKey = Object.create(null);
    const ops =
      this.state.mode === Mode.oneKey
        ? this.recorder.getLastOperations()
        : this.recorder.getOperations();

    this.notes = PianoPage.notesFromOps(ops);
    this.recorder.startRecording();
    this.setState({ mode: Mode.oneKey });
  };

  onKeyClick = (note: number) => {
    this.recorder.clickNote(note);
  };

  oneKeyPlay = (e: KeyboardEvent) => {
    const { type, repeat, keyCode } = e;

    if (repeat || keyCode < 65 || keyCode > 90) {
      return;
    }

    const piano = this.recorder.getPiano();

    if (type === "keyup") {
      const note = this.notesByKey[keyCode];
      if (typeof note === "number") {
        delete this.notesByKey[keyCode];
        piano.stopNote(note);
      }
    } else if (type === "keydown") {
      // When holding multiple keys, linux occasionally fires a 2nd keydown
      // event (with repeat === false) just before triggering keyup, so just
      // ignore keydown when we "know" the key is already down.
      if (typeof this.notesByKey[keyCode] !== "undefined") {
        return;
      }

      if (this.notesIndex >= this.notes.length) {
        // We've already exhausted our queued notes
        return;
      }

      const note = this.notes[this.notesIndex];
      this.notesByKey[keyCode] = note;
      piano.startNote(note);
      this.notesIndex++;
    }
  };

  render() {
    const { title, mode, activeKeys, progress, stream } = this.state;

    const recorderState = this.recorder.getState();
    const hasOperations = Boolean(this.recorder.operations.length);
    const hasStream = Boolean(stream);

    // console.log({ recorderState, hasOperations, ...this.state });

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
    const canReset = mode === Mode.oneKey || hasOperations;

    return (
      <Template
        title="Melody"
        intro={
          <p>
            Wanna capture a <Link to={example}>short musical idea</Link> or
            share it with others? Tap some notes or play your MIDI keyboard
            (Chrome only), and click <i>Save</i>. You can share the resulting
            page URL or bookmark it.
          </p>
        }
      >
        <section className="piano-2col">
          <div>
            {mode === Mode.shared && (
              <span className="title-ui">
                <Title title={title} onChange={this.setTitle} />
                {!title && " (click to rename)"}
              </span>
            )}

            {hasOperations && (
              <Preview
                handlePlay={this.play}
                handleStop={this.stop}
                isPlaying={progress !== 0}
                isWaiting={false}
                progress={progress}
              />
            )}

            {canMakeChanges && (
              <button
                type="button"
                className="btn btn-warning med-btn"
                onClick={this.makeChanges}
              >
                <i className="fa fa-wrench" aria-hidden="true" />{" "}
                <span>Make changes</span>
              </button>
            )}

            {canRecordMore && (
              <button
                type="button"
                className="btn btn-warning med-btn"
                onClick={this.recordMore}
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
                onClick={this.startOneKey}
              >
                <i className="fa fa-clock-o" aria-hidden="true" />{" "}
                <span>Fix the timing</span>
              </button>
            )}

            {canSave && (
              <button
                type="button"
                onClick={this.save}
                className="btn btn-primary med-btn"
              >
                <i className="fa fa-save" aria-hidden="true" />{" "}
                <span>Save</span>
              </button>
            )}

            {canShare && (
              <button
                type="button"
                onClick={this.share}
                className="btn btn-primary med-btn"
              >
                <i className="fa fa-save" aria-hidden="true" />{" "}
                <span>Share</span>
              </button>
            )}
          </div>

          <div>
            <Status
              isPlaying={recorderState === RecorderState.playing}
              isRecording={recorderState === RecorderState.recording}
            />

            {canReset ? (
              <button
                type="button"
                onClick={this.reset}
                id="reset"
                title="Start over"
                className="btn btn-danger med-btn"
              >
                <i className="fa fa-trash" aria-label="Start over" />
              </button>
            ) : (
              <span className="fakeReset" />
            )}
          </div>
        </section>

        <Keyboard
          activeKeys={activeKeys}
          onKeyClick={mode === Mode.recording ? this.onKeyClick : undefined}
        />
        <PianoSpeed />

        <div style={{ marginTop: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={this.state.shepardMode}
              onChange={() =>
                this.setState(prev => ({ shepardMode: !prev.shepardMode }))
              }
            />{" "}
            Shepard tones mode
          </label>
        </div>

        <BottomRightAd />

        {mode === Mode.shared && (
          <section style={{ minHeight: "8rem" }}>
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
}

import React from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";

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

enum Mode {
  recording = "recording",
  oneKey = "oneKey",
  shared = "shared",
}

interface MatchItems {
  stream?: string;
  title?: string;
}

interface PianoPageProps extends RouteComponentProps<MatchItems> {}

interface PianoPageState {
  activeKeys: ActiveKeys;
  progress: number;
  mode: Mode;
  stream: string;
  title: string;
  undoStream: string;
}

export default class PianoPage extends React.Component<
  PianoPageProps,
  PianoPageState
> {
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
    { match, location }: PianoPageProps,
    recorder: Recorder
  ): PianoPageState {
    const { params } = match;
    const { pathname } = location;

    const stream = params.stream || "";
    const title = params.title ? decodeURIComponent(params.title) : "";
    const ops = Ops.operationsFromStream(stream);

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
    };
  }

  componentDidMount() {
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

  onRecorderProgress: RecorderProgressListener = progress => {
    this.setState({ progress });
  };

  onActiveKeysChange: PianoActiveKeysListener = activeKeys => {
    this.setState({ activeKeys });
  };

  play = () => {
    this.recorder.play();
  };

  stop = () => {
    this.recorder.stop();
  };

  save = () => {
    this.recorder.stop();
    this.setState({ mode: Mode.recording }, () => {
      const stream = Ops.streamFromOperations(this.recorder.getOperations());
      if (stream) {
        this.props.history.push(Paths.pianoPrefix(`/record/${stream}`));
      }
    });
  };

  share = () => {
    this.recorder.stop();
    const stream = Ops.streamFromOperations(this.recorder.getOperations());
    this.props.history.push(Paths.pianoPrefix(`/songs/${stream}`));
  };

  reset = () => {
    this.recorder.startRecording();
    this.setState({ mode: Mode.recording }, () => {
      this.props.history.push(Paths.pianoPrefix("/record"));
    });
  };

  setTitle = (rawTitle: string) => {
    const title = rawTitle.trim();

    this.setState({ title }, () => {
      const s = this.state.stream;
      const t = Ops.fixedEncodeURIComponent(title);

      this.props.history.replace(Paths.pianoPrefix(`/songs/${s}/${t}`));
    });
  };

  makeChanges = () => {
    this.setState({ mode: Mode.recording });
    const stream = Ops.streamFromOperations(this.recorder.getOperations());
    this.props.history.push(Paths.pianoPrefix(`/record/${stream}`));
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
    // legacy URLs
    if (window.location.hash) {
      const m = window.location.hash.match(/s=(\w+)(?:&t=(.*))?/);
      if (m) {
        const path = m[2] ? `/songs/${m[1]}/${m[2]}` : `/songs/${m[1]}`;

        return <Redirect to={Paths.pianoPrefix(path)} />;
      }
    }

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
      <Template app="songs">
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
                className="btn btn-danger med-btn"
              >
                <i className="fa fa-save" aria-hidden="true" />{" "}
                <span>Save</span>
              </button>
            )}

            {canShare && (
              <button
                type="button"
                onClick={this.share}
                className="btn btn-danger med-btn"
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

            {canReset && (
              <button
                type="button"
                onClick={this.reset}
                id="reset"
                title="Start over"
                className="btn btn-danger med-btn"
                style={{ marginLeft: "1em" }}
              >
                <i className="fa fa-trash" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>

        <Keyboard
          activeKeys={activeKeys}
          onKeyClick={mode === Mode.recording ? this.onKeyClick : undefined}
        />

        <section style={{ minHeight: "8rem" }}>
          {mode === Mode.shared && (
            <>
              <h3>This is not saved</h3>
              <p>
                This "recording" exists only as a URL, so bookmark this page or
                copy it to clipboard:{" "}
                <Saver href={window.location.href} title={title} />
              </p>
            </>
          )}
        </section>
      </Template>
    );
  }
}

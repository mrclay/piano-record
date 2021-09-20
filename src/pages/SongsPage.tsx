import React from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";

import * as C from "../constants";
import BigPlay from "../ui/BigPlay";
import Keyboard from "../ui/Keyboard";
import Ops, { TimedOp } from "../Ops";
import Paths from "../Paths";
import Piano, {
  ActiveKeys,
  PianoActiveKeysListener,
  PianoResetListener,
} from "../Piano";
import Recorder, {
  RecorderProgressListener,
  RecorderStateListener,
} from "../Recorder";
import Template from "./Template";
import Title from "../ui/Title";
import Saver from "../ui/Saver";

interface MatchItems {
  stream?: string;
  title?: string;
}

interface SongsPageProps extends RouteComponentProps<MatchItems> {}

interface SongsPageState {
  activeKeys: ActiveKeys;
  canResave: boolean;
  playing: boolean;
  progress: number;
  state: string;
  stream: string;
  title: string;
  waiting: boolean;
}

export default class SongsPage extends React.Component<
  SongsPageProps,
  SongsPageState
> {
  notesByKey: Record<string, number>;
  notes: number[];
  notesIndex: number;
  recorder: Recorder;

  constructor(props: SongsPageProps) {
    super(props);

    this.recorder = new Recorder();
    this.state = SongsPage.stateFromProps(props, this.recorder);
    this.notes = SongsPage.notesFromOps(this.recorder.getOperations());
    this.notesIndex = 0;
    this.notesByKey = Object.create(null);
  }

  static notesFromOps(ops: TimedOp[]) {
    return ops
      .filter(([midiNote]) => {
        return midiNote[0] === C.OP_NOTE_DOWN;
      })
      .map(([midiNote]) => {
        return midiNote[1];
      });
  }

  static stateFromProps(
    { match }: SongsPageProps,
    recorder: Recorder
  ): SongsPageState {
    const { params } = match;
    const stream = params.stream || "";
    const title = params.title ? decodeURIComponent(params.title) : "";
    const ops = Ops.operationsFromStream(stream);

    if (recorder) {
      recorder.setOperations(ops);
    }

    return {
      playing: false,
      stream,
      title,
      activeKeys: Piano.getActiveKeys(),
      canResave: false,
      state: C.STOPPED,
      progress: 0,
      waiting: false,
    };
  }

  componentDidMount() {
    document.title = "Simple Piano";
    this.recorder.addEventListener("state", this.onRecorderState);
    this.recorder.addEventListener("progress", this.onRecorderProgress);
    const piano = this.recorder.getPiano();
    piano.addEventListener("activeKeysChange", this.onActiveKeysChange);
    piano.addEventListener("reset", this.reset);
    document.addEventListener("keydown", this.oneKeyPlay);
    document.addEventListener("keyup", this.oneKeyPlay);
  }

  componentWillUnmount() {
    this.recorder.removeEventListener("state", this.onRecorderState);
    this.recorder.removeEventListener("progress", this.onRecorderProgress);
    const piano = this.recorder.getPiano();
    piano.removeEventListener("activeKeysChange", this.onActiveKeysChange);
    piano.removeEventListener("reset", this.reset);
    document.removeEventListener("keydown", this.oneKeyPlay);
    document.removeEventListener("keyup", this.oneKeyPlay);
  }

  onRecorderProgress: RecorderProgressListener = progress => {
    this.setState({ progress });
  };

  onActiveKeysChange: PianoActiveKeysListener = activeKeys => {
    this.setState({ activeKeys });
  };

  onRecorderState: RecorderStateListener = state => {
    this.setState({ state });
  };

  play = () => {
    this.recorder.play();
    this.setState({ playing: true });
  };

  resave = () => {
    this.recorder.stop();
    const stream = Ops.streamFromOperations(this.recorder.getOperations());
    this.props.history.push(Paths.pianoPrefix(`/songs/${stream}`));
  };

  stop = () => {
    this.recorder.stop();
    this.setState({ playing: false });
  };

  reset: PianoResetListener = () => {
    this.recorder.stop();
    this.setState({ playing: false }, () => {
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
    } else {
      if (!this.state.stream) {
        return <Redirect to={Paths.pianoPrefix("/record")} />;
      }
    }

    const { title, progress, state, canResave, waiting, activeKeys } =
      this.state;

    return (
      <Template app="songs">
        <section>
          <BigPlay
            state={state}
            handlePlay={this.play}
            handleStop={this.stop}
            progress={progress}
            waiting={waiting}
          />
          <Title title={title} onChange={this.setTitle} />
          {!title && "(click to rename)"}
          <button
            onClick={this.reset}
            id="reset"
            disabled={waiting}
            className="btn btn-danger med-btn"
            style={{ marginLeft: "1em" }}
          >
            <i className="fa fa-circle" aria-hidden="true" />{" "}
            <span>Start over</span>
          </button>
          <button
            id="oneKeyPlay"
            className="btn btn-warning med-btn"
            title="hint: use your keyboard"
            onClick={() => {
              this.recorder.startRecording();
              this.notesIndex = 0;
              this.notesByKey = Object.create(null);
              this.setState({ canResave: true });
            }}
          >
            "one key play"
          </button>
          {canResave && (
            <button onClick={this.resave} className="btn btn-danger med-btn">
              <i className="fa fa-circle" aria-hidden="true" />{" "}
              <span>Re-save</span>
            </button>
          )}
        </section>
        <Keyboard activeKeys={activeKeys} />
        <section>
          <h3>This is not saved</h3>
          <p>
            This "recording" exists only as a URL, so bookmark this page or copy
            it to clipboard: <Saver href={window.location.href} title={title} />
          </p>
        </section>
      </Template>
    );
  }
}

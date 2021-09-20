import React from "react";
import { RouterProps } from "react-router";

import * as C from "../constants";
import Keyboard from "../ui/Keyboard";
import Ops from "../Ops";
import Paths from "../Paths";
import Piano, {
  ActiveKeys,
  PianoActiveKeysListener,
  PianoEvents,
  PianoOperationListener,
  PianoResetListener,
} from "../Piano";
import Recorder, {
  RecorderProgressListener,
  RecorderStateListener,
} from "../Recorder";
import Preview from "../ui/Preview";
import Status from "../ui/Status";
import Template from "./Template";

interface RecordPageState {
  activeKeys: ActiveKeys;
  progress: number;
  state: string;
  waiting: boolean;
}

export default class RecordPage extends React.Component<
  RouterProps,
  RecordPageState
> {
  recorder: Recorder;

  constructor(props: RouterProps) {
    super(props);

    this.recorder = new Recorder();
    this.recorder.startRecording();

    this.state = {
      activeKeys: Piano.getActiveKeys(),
      waiting: true,
      state: this.recorder.getState(),
      progress: 0,
    };
  }

  onRecorderProgress: RecorderProgressListener = progress => {
    this.setState({ progress });
  };

  onActiveKeysChange: PianoActiveKeysListener = activeKeys => {
    this.setState({
      activeKeys,
    });
  };

  onRecorderState: RecorderStateListener = state => {
    this.setState(oldState => ({
      ...oldState,
      ...(state === C.STOPPED ? { waiting: false } : undefined),
    }));
  };

  onPianoOperation: PianoOperationListener = () => {
    // just to let us know the user is recording
    this.setState({
      waiting: false,
    });
  };

  componentDidMount() {
    document.title = "Simple Piano";
    this.recorder.addEventListener("state", this.onRecorderState);
    this.recorder.addEventListener("progress", this.onRecorderProgress);
    const piano = this.recorder.getPiano();
    piano.addEventListener(
      PianoEvents.activeKeysChange,
      this.onActiveKeysChange
    );
    piano.addEventListener(PianoEvents.reset, this.reset);
    piano.addEventListener(PianoEvents.operation, this.onPianoOperation);
  }

  componentWillUnmount() {
    this.recorder.removeEventListener("state", this.onRecorderState);
    this.recorder.removeEventListener("progress", this.onRecorderProgress);
    const piano = this.recorder.getPiano();
    piano.removeEventListener(
      PianoEvents.activeKeysChange,
      this.onActiveKeysChange
    );
    piano.removeEventListener(PianoEvents.reset, this.reset);
    piano.removeEventListener(PianoEvents.operation, this.onPianoOperation);
  }

  play = () => {
    this.recorder.play();
  };

  stop = () => {
    this.recorder.stop();
  };

  save = () => {
    if (this.state.waiting) {
      return;
    }

    this.recorder.stop();
    const stream = Ops.streamFromOperations(this.recorder.getOperations());
    this.props.history.push(Paths.pianoPrefix(`/songs/${stream}`));
  };

  reset: PianoResetListener = () => {
    this.recorder.stop();
    this.recorder.startRecording();
    this.setState(
      {
        waiting: true,
      },
      () => {
        this.props.history.replace(Paths.pianoPrefix("/record"));
      }
    );
  };

  onKeyClick = (note: number) => {
    this.recorder.clickNote(note);
  };

  render() {
    const { activeKeys, progress, state, waiting } = this.state;

    return (
      <Template app="record">
        <section className="piano-2col">
          <div>
            <Preview
              state={state}
              waiting={waiting}
              handlePlay={this.play}
              handleStop={this.stop}
              progress={progress}
            />
            <button
              onClick={this.save}
              id="save"
              disabled={waiting}
              className="btn btn-primary med-btn"
            >
              <i className="fa fa-floppy-o" aria-hidden="true" />{" "}
              <span>Save</span>
            </button>
            <button
              onClick={this.reset}
              id="reset"
              disabled={waiting}
              className="btn btn-danger med-btn"
            >
              <i className="fa fa-circle" aria-hidden="true" />{" "}
              <span>Start over</span>
            </button>
          </div>
          <div>
            <Status state={state} waiting={waiting} />
          </div>
        </section>
        <Keyboard
          activeKeys={activeKeys}
          onKeyClick={state === C.RECORDING ? this.onKeyClick : undefined}
        />
      </Template>
    );
  }
}

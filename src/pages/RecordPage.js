import * as C from "../constants";
import Keyboard from '../ui/Keyboard';
import Ops from "../Ops";
import Paths from '../Paths';
import Piano from "../Piano";
import PianoRecorder from "../PianoRecorder";
import Preview from "../ui/Preview";
import React from 'react';
import Status from "../ui/Status";
import Template from "../pages/Template";

export default class Record extends React.Component {

  constructor(props) {
    super(props);

    this.recorder = new PianoRecorder();
    this.recorder.startRecording();

    this.state = {
      activeKeys: Piano.getActiveKeys(),
      waiting: true,
      state: this.recorder.getState(),
      progress: 0,
    };

    this.stop = this.stop.bind(this);
    this.play = this.play.bind(this);
    this.reset = this.reset.bind(this);
    this.save = this.save.bind(this);
    this.onKeyClick = this.onKeyClick.bind(this);
    this.onActiveKeysChange = this.onActiveKeysChange.bind(this);
    this.onPianoOperation = this.onPianoOperation.bind(this);
    this.onRecorderState = this.onRecorderState.bind(this);
    this.onRecorderProgress = this.onRecorderProgress.bind(this);
  }

  onRecorderProgress(progress) {
    this.setState({progress});
  }

  onActiveKeysChange(activeKeys) {
    this.setState({
      activeKeys
    });
  }

  onRecorderState(state) {
    let newState = {state};
    if (state === C.STOPPED) {
      newState.waiting = false;
    }
    this.setState(newState);
  }

  onPianoOperation(op) {
    // just to let us know the user is recording
    this.setState({
      waiting: false
    });
  }

  componentDidMount() {
    this.recorder.addEventListener('state', this.onRecorderState);
    this.recorder.addEventListener('progress', this.onRecorderProgress);
    const piano = this.recorder.getPiano();
    piano.addEventListener('activeKeysChange', this.onActiveKeysChange);
    piano.addEventListener('reset', this.reset);
    piano.addEventListener('operation', this.onPianoOperation);
  }

  componentWillUnmount() {
    this.recorder.removeEventListener('state', this.onRecorderState);
    this.recorder.removeEventListener('progress', this.onRecorderProgress);
    const piano = this.recorder.getPiano();
    piano.removeEventListener('activeKeysChange', this.onActiveKeysChange);
    piano.removeEventListener('reset', this.reset);
    piano.removeEventListener('operation', this.onPianoOperation);
  }

  play() {
    this.recorder.play();
  }

  stop() {
    this.recorder.stop();
  }

  save() {
    if (this.state.waiting) {
      return;
    }

    this.recorder.stop();
    const stream = Ops.streamFromOperations(this.recorder.getOperations());
    this.props.history.push(Paths.prefix(`/songs/${stream}`));
  }

  reset(e) {
    this.recorder.stop();
    this.recorder.startRecording();
    this.setState({
      waiting: true,
    }, () => {
      this.props.history.replace(Paths.prefix('/record'));
    });
  }

  onKeyClick(key, note) {
    this.recorder.clickNote(key, note);
  }

  render() {
    return (
      <Template>
        <section className='piano-2col'>
          <div>
            <Preview
              state={this.state.state}
              waiting={this.state.waiting}
              handlePlay={this.play}
              handleStop={this.stop}
              progress={this.state.progress}
            />
            <button
              onClick={this.save}
              id="save"
              disabled={this.state.waiting}
              className="btn btn-primary">
              <i className="fa fa-floppy-o" aria-hidden="true"/> <span>Save</span>
            </button>
            <button
              onClick={this.reset}
              id="reset"
              disabled={this.state.waiting}
              className="btn btn-danger">
              <i className="fa fa-circle" aria-hidden="true"/> <span>Start over</span>
            </button>
          </div>
          <div>
            <Status state={this.state.state} waiting={this.state.waiting} />
          </div>
        </section>
        <Keyboard
          activeKeys={this.state.activeKeys}
          onKeyClick={this.state.state === C.RECORDING ? this.onKeyClick : undefined}
        />
      </Template>
    );
  }
}

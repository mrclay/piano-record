import React, { Component } from 'react';
import './App.css';
import {Piano} from 'tone-piano';
import Keyboard from './App/Keyboard';
import Controls from './App/Controls';
import Progress from './App/Progress';
import * as C from './App/constants';
import Ops from './App/Ops';

const location = window.location;

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      playState: C.NEW_RECORDING,
      progress: 0,
      firstTime: null,
      hasOperations: false
    };

    this.piano = new Piano(C.RANGE, C.VELOCITIES, C.USE_RELEASE).toMaster();
    this.operations = [];
    this.keyTimeouts = {};
    this.playAllIntervals = [];
    this.progressInterval = null;
    this.activeKeys = {};
    this.$one = document.querySelector.bind(document);

    this.handleSave = this.handleSave.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleKey = this.handleKey.bind(this);
  }

  componentDidMount() {
    // MIDI
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then((midiAccess) => {
        midiAccess.inputs.forEach((input) => {
          input.addEventListener('midimessage', (e) => {

            window.logMidi && console.log(e.data);

            if (e.data[0] === C.MIDI0_L1) {
              return this.reset();
            }

            const op = this.operationFromMidi(e.data);
            if (!op) {
              return;
            }
            this.addOperation(op, e.timeStamp);
            this.performOperation(op);
          });
        });
      });
    }

    this.piano.load(C.RAWGIT_URL).then(this.init.bind(this));
  }

  handlePlay() {
    this.setPlayState(C.PLAYING);
  }

  handleStop() {
    this.setPlayState(C.STOPPED);
  }

  init() {
    const m = location.hash.match(/s=(\w+)(?:&t=(.*))?/);
    if (!m) {
      return this.setPlayState(C.NEW_RECORDING);
    }

    const streamEncoded = m[1];
    const title = m[2] ? decodeURIComponent(m[2]) : '';
    const pattern = /[A-Z][a-z0-9]+/g;
    let token;
    let newComponentState = {
      title
    };

    // eslint-disable-next-line
    while (token = pattern.exec(streamEncoded)) {
      let opTime = Ops.decodeOp(token[0]);

      newComponentState.firstTime = 0;
      newComponentState.hasOperations = true;
      this.operations.push([opTime[0], opTime[1]]);
    }

    this.setState(newComponentState, () => {
      this.setPlayState(C.STOPPED);
    });
  }

  setPlayState(newState, after) {
    this.stopAll();

    let newComponentState = {
      progress: this.operations.length ? 1 : 0,
      playState: newState
    };

    if (newState === C.PLAYING && (!this.operations.length)) {
      return this.setPlayState(C.STOPPED, after);
    }

    switch (newState) {
      case C.NEW_RECORDING:
        this.operations = [];
        newComponentState.hasOperations = false;
        newComponentState.firstTime = undefined;
        newComponentState.title = '';
        break;

      case C.STOPPED:
        break;

      case C.PLAYING:
        this.playAll();
        break;

      default: throw new Error();
    }

    this.setState(newComponentState, () => {
      after && after();
      // TODO just don't
      document.querySelector('body').dataset.state = newState;
    });
  }

  stopAll() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.playAllIntervals.forEach(clearTimeout);

    // DOM write!
    document.querySelectorAll('[data-note].active').forEach((el) => {
      el.classList.remove('active');
    });

    Object.keys(this.activeKeys).forEach((key) => {
      const note = parseInt(key.substr(1), 10);
      this.piano.keyUp(note);
    });

    this.activeKeys = {};

    this.playAllIntervals = [];
  }

  handleSave() {
    location.hash = Ops.getHash(this.operations, this.state.title);
    this.setPlayState(C.STOPPED);
  }

  playAll() {
    const numOperations = this.operations.length;
    const lastTime = this.operations[this.operations.length - 1][1] * C.TIME_RESOLUTION_DIVISOR;
    const startTime = (new Date()).getTime();
    let numPerformed = 0;

    this.progressInterval = setInterval(() => {
      const now = (new Date()).getTime();
      this.setState({
        progress: (now - startTime) / lastTime
      });
    }, 20);

    this.operations.forEach((el) => {
      // relying on the timer is awful, but Piano's "time" arguments just don't work.
      this.playAllIntervals.push(
        setTimeout(() => {
            this.performOperation(el[0]);
            numPerformed++;
            if (numPerformed === numOperations) {
              this.setPlayState(C.STOPPED);
            }
          },
          el[1] * C.TIME_RESOLUTION_DIVISOR
        )
      );
    });
  }

  handleReset() {
    this.stopAll();
    location.hash = '#';
    this.firstTime = undefined;
    this.setPlayState(C.NEW_RECORDING);
  }

  handleTitleChange(e) {
    this.setState({
      title: e.target.value
    });
  }

  handleKey(e) {
    e.persist();

    let target = e.target;

    if (target.parentNode.nodeName === 'BUTTON') {
      target = target.parentNode;
    }

    if (!target.dataset.note) {
      return;
    }

    e.preventDefault();
    const note = parseInt(target.dataset.note, 10);
    let op;

    if (this.keyTimeouts['z' + note]) {
      clearTimeout(this.keyTimeouts['z' + note]);
      delete this.keyTimeouts['z' + note];
    }

    // TODO ugh, DOM read
    if (target.classList.contains('active')) {
      op = Ops.operationFromMidi([C.MIDI0_NOTE_OFF, note, 0]);
      this.addOperation(op, e.timeStamp);
      this.performOperation(op);
    }

    op = Ops.operationFromMidi([C.MIDI0_NOTE_ON, note, 254]);

    this.addOperation(op, e.timeStamp);

    this.performOperation(op);

    this.keyTimeouts['z' + note] = setTimeout(() => {
      if (this.keyTimeouts['z' + note]) {
        op = Ops.operationFromMidi([C.MIDI0_NOTE_OFF, note, 0]);
        this.addOperation(op, e.timeStamp + 1000);
        this.performOperation(op);
      }
    }, 1000);

    return false;
  }

  performOperation(op) {
    switch (op[0]) {
      case C.OP_PEDAL_DOWN:
        return this.piano.pedalDown();

      case C.OP_PEDAL_UP:
        return this.piano.pedalUp();

      case C.OP_NOTE_DOWN:
        this.piano.keyDown(op[1]);
        this.activeKeys['k' + op[1]] = true;

        // DOM write!
        this.$one('[data-note="' + op[1] + '"]').classList.add('active');

        return;

      case C.OP_NOTE_UP:
        this.piano.keyUp(op[1]);
        delete this.activeKeys['k' + op[1]];

        // DOM write!
        this.$one('[data-note="' + op[1] + '"]').classList.remove('active');

        return;

      default:
        return;
    }
  }

  addOperation(op, timeInMs) {
    if (this.state.playState !== C.NEW_RECORDING) {
      return;
    }

    timeInMs = Math.round(timeInMs / C.TIME_RESOLUTION_DIVISOR);
    if (this.firstTime === undefined) {
      this.firstTime = timeInMs;
    }

    this.operations.push([op, (timeInMs - this.firstTime)]);

    this.setState({
      hasOperations: true
    });
  }

  render() {
    return (
      <div data-state={this.state.playState}>
        <h1 className={this.operations.length ? '' : 'unsaved'}>
          “{this.state.title ? this.state.title : C.DEFAULT_TITLE }”
        </h1>
        <Keyboard
          actives={[]}
          handleKey={this.handleKey}
        />
        <section>
          <Controls
            playState={this.state.playState}
            hasOperations={this.state.hasOperations}
            handleReset={this.handleReset}
            handleStop={this.handleStop}
            handlePlay={this.handlePlay}
          />
        </section>
        <section>
          <Progress
            ratio={this.state.progress}
          />
        </section>
        <section>
          <div className="input-group input-group-lg">
            <input id="title" type="text" className="form-control" placeholder="Title"
                   value={this.state.title}
                   onChange={this.handleTitleChange}
            />
            <span className="input-group-btn">
            <button onClick={this.handleSave} id="save" className="btn btn-default" type="button">
                <i className="fa fa-floppy-o" aria-hidden="true" /> Save to URL
            </button>
            </span>
          </div>
        </section>
      </div>
    );
  }
}

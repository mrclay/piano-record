import React from 'react';
import {Redirect} from 'react-router-dom';

import * as C from "../constants";
import BigPlay from '../ui/BigPlay';
import Keyboard from '../ui/Keyboard';
import Ops from "../Ops";
import Paths from '../Paths';
import Piano from "../Piano";
import PianoRecorder from "../PianoRecorder";
import Template from "../pages/Template";
import Title from '../ui/Title';
import Table from '../ui/Table';

export default class SongsPage extends React.Component {

  constructor(props) {
    super(props);

    this.recorder = new PianoRecorder();
    this.state = SongsPage.stateFromProps(props, this.recorder);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.recorder.stop();
      this.setState(SongsPage.stateFromProps(nextProps, this.recorder));
    }
  }

  static stateFromProps({match}, recorder) {
    const {params} = match;
    const stream = params.stream;
    const title = params.title ? decodeURIComponent(params.title) : '';

    if (recorder) {
      recorder.setOperations(Ops.operationsFromStream(stream));
    }

    return {
      stream,
      title,
      activeKeys: Piano.getActiveKeys(),
      state: C.STOPPED,
      progress: 0,
    };
  }

  componentDidMount() {
    document.title = 'Simple Piano';
    this.recorder.addEventListener('state', this.onRecorderState);
    this.recorder.addEventListener('progress', this.onRecorderProgress);
    const piano = this.recorder.getPiano();
    piano.addEventListener('activeKeysChange', this.onActiveKeysChange);
    piano.addEventListener('reset', this.reset);
  }

  componentWillUnmount() {
    this.recorder.removeEventListener('state', this.onRecorderState);
    this.recorder.removeEventListener('progress', this.onRecorderProgress);
    const piano = this.recorder.getPiano();
    piano.removeEventListener('activeKeysChange', this.onActiveKeysChange);
    piano.removeEventListener('reset', this.reset);
  }

  onRecorderProgress = progress => {
    this.setState({progress});
  };

  onActiveKeysChange = activeKeys => {
    this.setState({
      activeKeys
    });
  };

  onRecorderState = state => {
    this.setState({state});
  };

  play = () => {
    this.recorder.play();
    this.setState({playing: true});
  };

  stop = () => {
    this.recorder.stop();
    this.setState({playing: false});
  };

  reset = () => {
    this.recorder.stop();
    this.setState({playing: false}, () => {
      this.props.history.push(Paths.pianoPrefix('/record'));
    });
  };

  setTitle = props => {
    const title = props.title.trim();

    this.setState({
      title
    }, () => {
      const s = this.state.stream;
      const t = Ops.fixedEncodeURIComponent(title);

      this.props.history.replace(Paths.pianoPrefix(`/songs/${s}/${t}`));
    });
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
        return <Redirect to={Paths.pianoPrefix('/record')} />;
      }
    }

    return (
      <Template>
        <section>
          <BigPlay
            state={this.state.state}
            handlePlay={this.play}
            handleStop={this.stop}
            progress={this.state.progress}
          />
          <Title
            title={this.state.title}
            onChange={this.setTitle}
          />
          {!this.state.title && '(click to rename)'}
          <button
            onClick={this.reset}
            id="reset"
            disabled={this.state.waiting}
            className="btn btn-danger"
            style={{marginLeft: '1em'}}
            >
            <i className="fa fa-circle" aria-hidden="true"/> <span>New Song</span>
          </button>
        </section>
        <Keyboard
          activeKeys={this.state.activeKeys}
        />
        <section>
          <h3>This song's in danger!</h3>
          <p>As awesome as it is, we don't store your song, so bookmark this page or copy one of these somewhere else.</p>
          <Table
            href={window.location.href}
            title={this.state.title}
          />
        </section>
      </Template>
    );
  }
}

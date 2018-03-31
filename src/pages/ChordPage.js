import React from 'react';
import {Redirect} from 'react-router-dom';

import * as C from "../constants";
import BigPlay from "../ui/BigPlay";
import Keyboard from '../ui/Keyboard';
import Ops from "../Ops";
import Paths from '../Paths';
import Piano from "../Piano";
import Template from "../pages/Template";
import Title from "../ui/Title";
import Table from "../ui/Table";

function stateFromProps(params) {
  const notes = params.notes ? params.notes.split(',') : [];
  const title = params.title ? decodeURIComponent(params.title) : '';

  let activeKeys = Piano.getActiveKeys();
  notes.forEach(note => {
    activeKeys[note] = true;
  });

  return {
    title,
    activeKeys,
  };
}

export default class ChordPage extends React.Component {

  constructor(props) {
    super(props);

    this.piano = new Piano();
    this.playTimeout = null;

    this.state = {
      ...stateFromProps(props.match.params),
      playing: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.piano.stopAll();
      this.setState({
        ...stateFromProps(nextProps.match.params),
        playing: false,
      });
    }
  }

  componentDidMount() {
    document.title = 'Simple Chord';
    this.piano.addEventListener('reset', this.reset);
  }

  componentWillUnmount() {
    this.piano.removeEventListener('reset', this.reset);
  }

  setTitle = props => {
    const title = props.title.trim();

    this.setState({
      title
    }, () => {
      this.save('setTitle');
    });
  };

  play = () => {
    this.piano.stopAll();
    Object.keys(this.state.activeKeys).forEach(note => {
      if (this.state.activeKeys[note]) {
        this.piano.startNote(note);
      }
    });
    this.setState({
      playing: true,
    });

    // play for 5 secs
    clearTimeout(this.playTimeout);
    this.playTimeout = setTimeout(this.stop, 5000);
  };

  stop = () => {
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
    this.piano.stopAll();
    this.setState({
      playing: false,
    });
  };

  save = (e) => {
    let notes = [];
    Object.keys(this.state.activeKeys).forEach(key => {
      if (this.state.activeKeys[key]) {
        notes.push(key);
      }
    });

    if (!notes.length) {
      return;
    }

    let path = notes.join(',');
    if (this.state.title) {
      path += '/' + Ops.fixedEncodeURIComponent(this.state.title);
    }

    const method = (e === 'setTitle') ? 'replace' : 'push';
    this.props.history[method](Paths.chordPrefix(path));
  };

  reset = () => {
    this.props.history.push(Paths.chordPrefix('/'));
  };

  onKeyClick = note => {
    let activeKeys = {
      ...this.state.activeKeys
    };
    activeKeys[note] = !activeKeys[note];

    this.setState(
      {activeKeys},
      this.play
    );
  };

  render() {
    if (window.location.hash) {
      // legacy URLs
      const m = window.location.hash.match(/n=([\d,]+)(?:&c=(.*))?/);
      if (m) {
        const path = m[2] ? `/${m[1]}/${m[2]}` : `/${m[1]}`;

        return <Redirect to={Paths.chordPrefix(path)} />;
      }
    }

    return (
      <Template app='chord'>
        <section>
          <div>
            <BigPlay
              state={this.state.playing ? C.PLAYING : C.STOPPED}
              handlePlay={this.play}
              handleStop={this.stop}
            />
            <Title
              title={this.state.title}
              onChange={this.setTitle}
            />
            {!this.state.title && '(click to rename)'}
            <button
              onClick={this.save}
              id="save"
              className="btn btn-primary med-btn"
              style={{marginLeft: '1em'}}
              >
              <i className="fa fa-floppy-o" aria-hidden="true"/> <span>Save</span>
            </button>
            <button
              onClick={this.reset}
              id="reset"
              className="btn btn-danger med-btn">
              <i className="fa fa-circle" aria-hidden="true"/> <span>Reset</span>
            </button>
          </div>
        </section>
        <Keyboard
          activeKeys={this.state.activeKeys}
          onKeyClick={this.onKeyClick}
        />
        {this.props.match.params.notes &&
        <section>
          <h3>This chord's in danger!</h3>
          <p>As awesome as it is, we don't store your chord, so bookmark this page or
            copy one of these somewhere else.</p>
          <Table
            href={window.location.href}
            title={this.state.title}
          />
        </section>
        }
      </Template>
    );
  }
}

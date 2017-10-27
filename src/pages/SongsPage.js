import * as C from "../constants";
import BigPlay from '../ui/BigPlay';
import Keyboard from '../ui/Keyboard';
import Ops from "../Ops";
import Paths from '../Paths';
import Piano from "../Piano";
import PianoRecorder from "../PianoRecorder";
import React from 'react';
import {Redirect} from 'react-router-dom';
import Template from "../pages/Template";
import Title from '../ui/Title';

export default class SongsPage extends React.Component {
  constructor(props) {
    super(props);

    this.recorder = new PianoRecorder();
    this.state = this.stateFromProps(props, this.recorder);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.recorder.stop();
      this.setState(this.stateFromProps(nextProps, this.recorder));
    }
  }

  stateFromProps({match}, recorder) {
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

  handleFocus = e => {
    e.target.select();
  };

  render() {
    if (window.location.hash) {
      // legacy URLs
      const m = window.location.hash.match(/s=(\w+)(?:&t=(.*))?/);
      if (m) {
        const path = m[2] ? `/songs/${m[1]}/${m[2]}` : `/songs/${m[1]}`;

        return <Redirect to={Paths.pianoPrefix(path)} />;
      }
    }

    const htmlize = Ops.encodeHtml;
    // encode parens in titles, for markdown's sake
    const url = Ops.encodeMoreURIComponents(window.location.href);

    const title = this.state.title || C.DEFAULT_TITLE;
    const markdownLink = `[${htmlize(title)}](${htmlize(url)})`;
    const htmlLink = `<a href="${htmlize(url)}">${htmlize(title)}</a>`;

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
          <table className="table table-bordered table-striped urls">
            <colgroup><col className="col-xs-1" /><col className="col-xs-7" /></colgroup>
            <tbody>
              <tr>
                <th scope="row">URL</th>
                <td><input type='text' value={url} readOnly
                           onFocus={this.handleFocus} onClick={this.handleFocus} /></td>
              </tr>
              <tr>
                <th scope="row">Markdown</th>
                <td><input type='text' value={markdownLink} readOnly
                           onFocus={this.handleFocus} onClick={this.handleFocus} /></td>
              </tr>
              <tr>
                <th scope="row">HTML</th>
                <td><input type='text' value={htmlLink} readOnly
                           onFocus={this.handleFocus} onClick={this.handleFocus} /></td>
              </tr>
            </tbody>
          </table>
        </section>
      </Template>
    );
  }
}

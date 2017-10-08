import * as C from "../constants";
import BigPlay from '../ui/BigPlay';
import Keyboard from '../ui/Keyboard';
import Ops from "../Ops";
import Paths from '../Paths';
import Piano from "../Piano";
import PianoRecorder from "../PianoRecorder";
import React from 'react';
import Template from "../pages/Template";
import Title from '../ui/Title';

export default class SongsPage extends React.Component {
  constructor(props) {
    super(props);

    const params = this.props.match.params;
    const stream = params.stream;
    const titleEncoded = params.title ? params.title : '';

    this.recorder = new PianoRecorder({
      operations: Ops.operationsFromStream(stream),
    });

    this.state = {
      stream,
      title: decodeURIComponent(titleEncoded),
      titleEncoded,
      activeKeys: Piano.getActiveKeys(),
      state: this.recorder.getState(),
      progress: 0,
    };

    this.setTitle = this.setTitle.bind(this);
    this.stop = this.stop.bind(this);
    this.play = this.play.bind(this);
    this.reset = this.reset.bind(this);
    this.onActiveKeysChange = this.onActiveKeysChange.bind(this);
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
    this.setState({state});
  }

  componentDidMount() {
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

  play() {
    this.recorder.play();
    this.setState({playing: true});
  }

  stop() {
    this.recorder.stop();
    this.setState({playing: false});
  }

  reset() {
    this.recorder.stop();
    this.setState({playing: false}, () => {
      this.props.history.push(Paths.prefix('/record'));
    });
  }

  static encodeMoreURIComponents(str) {
    return str.replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }

  static fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }

  static encodeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  setTitle(props) {
    const title = props.title.trim();

    this.setState({
      title,
      titleEncoded: SongsPage.fixedEncodeURIComponent(title),


    }, () => {
      const s = this.state.stream;
      const t = this.state.titleEncoded;

      this.props.history.push(Paths.prefix(`/songs/${s}/${t}`));
    });
  }

  handleFocus(e) {
    e.target.select();
  }

  render() {
    const htmlize = SongsPage.encodeHtml;

    // encode parens in titles, for markdown's sake
    const url = SongsPage.encodeMoreURIComponents(window.location.href);

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

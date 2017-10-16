import * as C from "../constants";
import BigPlay from "../ui/BigPlay";
import Keyboard from '../ui/Keyboard';
import Ops from "../Ops";
import Paths from '../Paths';
import Piano from "../Piano";
import React from 'react';
import {Redirect} from 'react-router-dom';
import Template from "../pages/Template";
import Title from "../ui/Title";

export default class ChordPage extends React.Component {

  constructor(props) {
    super(props);

    this.piano = new Piano();
    this.playTimeout = null;

    this.state = Object.assign({}, this.stateFromProps(props), {
      playing: false,
    });
  }

  stateFromProps({match}) {
    const {params} = match;
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

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.piano.stopAll();
      this.setState(Object.assign(this.stateFromProps(nextProps), {
        playing: false,
      }));
    }
  }

  componentDidMount() {
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

  reset = e => {
    this.props.history.push(Paths.chordPrefix('/'));
  };

  onKeyClick = note => {
    let activeKeys = Object.assign({}, this.state.activeKeys);
    activeKeys[note] = !activeKeys[note];
    this.setState(
      {activeKeys},
      this.play
    );
  };

  handleFocus = e => {
    e.target.select();
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

    const htmlize = Ops.encodeHtml;
    // encode parens in titles, for markdown's sake
    const url = Ops.encodeMoreURIComponents(window.location.href);

    const title = this.state.title || C.DEFAULT_TITLE;
    const markdownLink = `[${htmlize(title)}](${htmlize(url)})`;
    const htmlLink = `<a href="${htmlize(url)}">${htmlize(title)}</a>`;

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
              className="btn btn-primary"
              style={{marginLeft: '1em'}}
              >
              <i className="fa fa-floppy-o" aria-hidden="true"/> <span>Save</span>
            </button>
            <button
              onClick={this.reset}
              id="reset"
              className="btn btn-danger">
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
          <p>As awesome as it is, we don't store your chord, so bookmark this page or copy one of these somewhere
            else.</p>
          <table className="table table-bordered table-striped urls">
            <colgroup>
              <col className="col-xs-1"/>
              <col className="col-xs-7"/>
            </colgroup>
            <tbody>
            <tr>
              <th scope="row">URL</th>
              <td><input type='text' value={url} readOnly
                         onFocus={this.handleFocus} onClick={this.handleFocus}/></td>
            </tr>
            <tr>
              <th scope="row">Markdown</th>
              <td><input type='text' value={markdownLink} readOnly
                         onFocus={this.handleFocus} onClick={this.handleFocus}/></td>
            </tr>
            <tr>
              <th scope="row">HTML</th>
              <td><input type='text' value={htmlLink} readOnly
                         onFocus={this.handleFocus} onClick={this.handleFocus}/></td>
            </tr>
            </tbody>
          </table>
        </section>
        }
      </Template>
    );
  }
}

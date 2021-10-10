import React, { MouseEvent } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";

import * as C from "../constants";
import BigPlay from "../ui/BigPlay";
import Keyboard from "../ui/Keyboard";
import Ops from "../Ops";
import Paths from "../Paths";
import Piano, { ActiveKeys } from "../Piano";
import Template from "./Template";
import Title from "../ui/Title";
import Saver from "../ui/Saver";

interface MatchItems {
  notes?: string;
  title?: string;
}

interface ChordPageProps extends RouteComponentProps<MatchItems> {}

interface ChordPageState {
  activeKeys: ActiveKeys;
  playing: boolean;
  title: string;
}

function stateFromProps({ notes, title = "" }: MatchItems): ChordPageState {
  const activeKeys = Piano.getActiveKeys();

  const notesArr = notes ? notes.split(",") : [];
  notesArr.forEach(note => {
    activeKeys[note] = true;
  });

  return {
    activeKeys,
    playing: false,
    title: decodeURIComponent(title),
  };
}

export default class ChordPage extends React.Component<
  ChordPageProps,
  ChordPageState
> {
  piano: Piano;
  playTimeout: number | null;

  constructor(props: ChordPageProps) {
    super(props);

    this.piano = new Piano();
    this.playTimeout = null;

    this.state = stateFromProps(props.match.params);
  }

  componentDidMount() {
    document.title = "Simple Chord";
    this.piano.addEventListener("reset", this.reset);
  }

  componentWillUnmount() {
    this.piano.removeEventListener("reset", this.reset);
  }

  setTitle = (title: string) => {
    this.setState({ title: title.trim() }, () => this.save("setTitle"));
  };

  play = () => {
    const { activeKeys } = this.state;

    this.piano.stopAll();
    Object.keys(activeKeys).forEach(note => {
      if (activeKeys[note]) {
        this.piano.startNote(Number(note));
      }
    });
    this.setState({ playing: true });

    // play for 5 secs
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
    }
    this.playTimeout = window.setTimeout(this.stop, 5000);
  };

  stop = () => {
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
    this.piano.stopAll();
    this.setState({ playing: false });
  };

  save = (e: MouseEvent<HTMLButtonElement> | string) => {
    const { activeKeys, title } = this.state;

    let notes: number[] = [];
    Object.keys(activeKeys).forEach(key => {
      if (activeKeys[key]) {
        notes.push(Number(key));
      }
    });

    if (!notes.length) {
      return;
    }

    let path = notes.join(",");
    if (title) {
      path += "/" + Ops.fixedEncodeURIComponent(title);
    }

    const method = e === "setTitle" ? "replace" : "push";
    this.props.history[method](Paths.chordPrefix(path));
  };

  reset = () => {
    this.stop();
    this.setState(stateFromProps(this.props.match.params));
    this.props.history.push(Paths.chordPrefix("/"));
  };

  onKeyClick = (note: number) => {
    let activeKeys = {
      ...this.state.activeKeys,
    };
    activeKeys[note] = !activeKeys[note];

    this.setState({ activeKeys }, this.play);
  };

  render() {
    const { activeKeys, playing, title } = this.state;

    if (window.location.hash) {
      // legacy URLs
      const m = window.location.hash.match(/n=([\d,]+)(?:&c=(.*))?/);
      if (m) {
        const path = m[2] ? `/${m[1]}/${m[2]}` : `/${m[1]}`;

        return <Redirect to={Paths.chordPrefix(path)} />;
      }
    }

    return (
      <Template app="chord">
        <section>
          <div>
            <BigPlay
              state={playing ? C.PLAYING : C.STOPPED}
              handlePlay={this.play}
              handleStop={this.stop}
              progress={0}
              waiting={false}
            />
            <Title title={title} onChange={this.setTitle} />
            {!title && "(click to rename)"}
            <button
              type="button"
              onClick={this.save}
              id="save"
              className="btn btn-primary med-btn"
              style={{ marginLeft: "1em" }}
            >
              <i className="fa fa-floppy-o" aria-hidden="true" />{" "}
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={this.reset}
              id="reset"
              className="btn btn-danger med-btn"
            >
              <i className="fa fa-circle" aria-hidden="true" />{" "}
              <span>Reset</span>
            </button>
          </div>
        </section>
        <Keyboard
          key={this.props.location.pathname}
          activeKeys={activeKeys}
          onKeyClick={this.onKeyClick}
        />
        {this.props.match.params.notes && (
          <section>
            <h3>This is not saved</h3>
            <p>
              This chord exists only as a URL, so bookmark this page or copy it
              to clipboard: <Saver href={window.location.href} title={title} />
            </p>
          </section>
        )}
      </Template>
    );
  }
}

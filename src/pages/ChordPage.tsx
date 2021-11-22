import React, { MouseEvent } from "react";
import {
  Link,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

import * as C from "../constants";
import BigPlay from "../ui/BigPlay";
import Keyboard from "../ui/Keyboard";
import Ops from "../Ops";
import Paths from "../Paths";
import Piano, { ActiveKeys } from "../Piano";
import Template from "./Template";
import Title from "../ui/Title";
import Saver from "../ui/Saver";
import { RouteComponentProps } from "../constants";

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

export default function Wrapper() {
  const navigate = useNavigate();
  const params: MatchItems = useParams();
  const { pathname } = useLocation();
  return (
    <ChordPage
      key={pathname}
      pathname={pathname}
      navigate={navigate}
      params={params}
    />
  );
}

class ChordPage extends React.Component<ChordPageProps, ChordPageState> {
  piano: Piano;
  playTimeout: number | null;

  constructor(props: ChordPageProps) {
    super(props);

    this.piano = new Piano();
    this.playTimeout = null;

    this.state = stateFromProps(props.params);
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

    this.props.navigate(Paths.chordPrefix(path), {
      replace: e === "setTitle",
    });
  };

  reset = () => {
    this.stop();
    this.setState(stateFromProps(this.props.params));
    this.props.navigate(Paths.chordPrefix("/"));
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

        return <Navigate to={Paths.chordPrefix(path)} />;
      }
    }

    const example = Paths.chordPrefix("/43,56,60,62,65/G7b9sus");

    return (
      <Template
        app="chord"
        title="Simple Chord"
        intro={
          <p>
            Wanna capture a <Link to={example}>chord</Link> or share it with
            others? Tap some notes or play your MIDI keyboard (Chrome only), and
            click <i>Save</i>. You can share the resulting page URL or bookmark
            it. <a href={C.SOURCE_URL}>Source</a>.
          </p>
        }
      >
        <section>
          <div>
            <BigPlay
              isPlaying={playing}
              handlePlay={this.play}
              handleStop={this.stop}
              progress={0}
              isWaiting={false}
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
              <i className="fa fa-trash" aria-label="Reset" />
            </button>
          </div>
        </section>
        <Keyboard
          key={this.props.pathname}
          activeKeys={activeKeys}
          onKeyClick={this.onKeyClick}
        />
        {this.props.params.notes && (
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

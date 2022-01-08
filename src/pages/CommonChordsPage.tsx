import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Key from "../music-theory/Key";
import { majorKeys } from "../music-theory/constants";
import Note from "../music-theory/Note";
import "./CommonChordsPage.scss";
import Paths from "../Paths";

Note.unicodeAccidentals = true;

const keys: Key[] = [
  ...majorKeys.map(name => Key.major(name)),
  // ...minorKeys.map(name => Key.minor(name)),
];

interface ParamsMatch {
  urlKey?: string;
}

type Chord = [roman: string, note: string, type: string, bassNote: string];

interface SeventhTeaserProps {
  sevenths: boolean;
  setSevenths(val: boolean): void;
}

const SeventhTeaser: FC<SeventhTeaserProps> = ({
  children,
  sevenths,
  setSevenths,
}) => {
  if (sevenths) {
    return <>{children}</>;
  }

  return (
    <div className="tease7ths">
      <p>
        <button
          type="button"
          className="btn btn-link"
          onClick={() => setSevenths(true)}
        >
          Enable 7th chords
        </button>{" "}
        to see more.
      </p>
    </div>
  );
};

function CommonChordsPage() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [showSelect, setShowSelect] = useState(false);
  const [sevenths, setSevenths] = useState(true);
  const navigate = useNavigate();
  const { urlKey = "" }: ParamsMatch = useParams();
  const key = keys.find(el => el.toString().replace(" ", "-") === urlKey);

  useEffect(() => {
    if (showSelect && selectRef.current) {
      selectRef.current.focus();
    }
  }, [showSelect]);

  if (!key) {
    navigate(Paths.commonChordsPrefix("/C-major"));
    return null;
  }

  const keyName = key + "";

  const remove7thMap: Record<string, string | undefined> = {
    m7: "m",
    maj7: "",
    "7": "",
    m7b5: "dim",
    "+": "+",
  };

  const rom = (str: string) => <b className="roman">{str}</b>;

  const f7 = (str: string): Chord => {
    const [one, two = "", three = ""] = str.split(" ");
    const note = key.getNoteFromRoman(one).toString();
    const bassNote = three
      ? key.getNoteFromRoman(three.replace("/", "")).toString()
      : "";
    return [one, note, two, bassNote];
  };

  // Allows removing 7ths
  const f = (str: string): Chord => {
    const [roman, note, type, bassNote] = f7(str);
    return sevenths
      ? [roman, note, type, bassNote]
      : [roman, note, remove7thMap[type] || "", bassNote];
  };

  function chords(...els: Chord[]) {
    const out: ReactNode[] = [];
    els.forEach((el, i) => {
      out.push(
        <span key={el.join()} className="chord" title={`${el[0]} ${el[2]}`}>
          <span className="note">{el[1]}</span>
          <span className="qual">{el[2]}</span>
          {el[3] !== "" && <span className="bass">/{el[3]}</span>}
        </span>
      );
      if (i < els.length - 1) {
        out.push(
          <span key={el.join() + "sep"} className="sep">
            {" "}
            .{" "}
          </span>
        );
      }
    });
    return out;
  }

  return (
    <div className="CC">
      <div className="head-flex">
        <div>
          <h1 className="h2">
            The Common Chords of: <i>{keyName}</i>
          </h1>
        </div>
        <div>
          {showSelect ? (
            <form className="form-inline">
              <select
                ref={selectRef}
                className="form-control"
                onChange={e => {
                  const newKey = keys.find(
                    el => el.toString() === e.target.value
                  );
                  if (newKey) {
                    navigate(
                      Paths.commonChordsPrefix(
                        `/${newKey!.toString().replace(" ", "-")}`
                      )
                    );
                  }
                }}
              >
                <optgroup label="major">
                  {keys
                    .filter(key => key.getQuality() === "major")
                    .map(key => key + "")
                    .map(name => (
                      <option key={name} selected={name === key.toString()}>
                        {name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="minor">
                  <option disabled>Coming soon!</option>
                </optgroup>
              </select>
            </form>
          ) : (
            <small className="key-switch">
              (
              <button
                className="btn btn-link"
                onClick={() => setShowSelect(true)}
                onMouseEnter={() => setShowSelect(true)}
                type="button"
              >
                choose key
              </button>
              )
            </small>
          )}
        </div>
      </div>

      <section>
        <p>
          This is a non-exhaustive roundup of chords songwriters often employ in{" "}
          {key.getQuality()} keys.
        </p>
        <p>
          If you usually think of a key as having seven chords plus mysterious
          chromatic chords, I encourage you to simply expand that collection and
          get to know the sound of all these, and consider them all
          ready-for-use in pieces in {keyName}.
        </p>
        <hr />
        <form style={{ margin: "2rem 4rem" }}>
          <div className="radio">
            <label>
              <input
                type="radio"
                name="sevenths"
                checked={sevenths}
                onChange={() => setSevenths(true)}
              />
              Show 7th chords in case I want to play the sevenths
            </label>
          </div>
          <div className="radio">
            <label>
              <input
                type="radio"
                name="sevenths"
                checked={!sevenths}
                onChange={() => setSevenths(false)}
              />
              Keep it simple (mostly) with triads
            </label>
          </div>
        </form>
        <hr />

        <h2>
          {chords(
            f("I maj7"),
            f("ii m7"),
            f("iii m7"),
            f("IV maj7"),
            f("V 7"),
            f("vi m7")
          )}
        </h2>
        <p>
          Many major key songs are made only from the first six{" "}
          <strong>diatonic chords</strong> (built solely with scale tones).
        </p>

        <h2>{chords(f7("V/IV 7"), f("V/V 7"), f("V/vi 7"), f("V/ii 7"))}</h2>
        <p>
          These are <strong>secondary dominants</strong> of the {rom("IV")},{" "}
          {rom("V")}, {rom("vi")} and {rom("ii")} chords.
        </p>
        <p>
          The secondary dominant of {rom("iii")}, {f("V/iii").slice(1)}7, is
          pretty rarely used.
        </p>

        <h2>
          {chords(
            f("ii m7b5"),
            f("bIII maj7"),
            f("iv m7"),
            f("v m7"),
            f("bVI maj7"),
            f("bVII 7")
          )}
        </h2>
        <p>
          These are <strong>borrowed chords</strong> from the minor (aeolian)
          mode.
        </p>

        <h2>
          {chords(f7("I 7"), f7("IV 7"), f7("v m"), f7("bVI 7"), f7("bVII 7"))}
        </h2>
        <p>
          These are often used in rock &amp; blues with the 7th notes just for
          color rather than serving a dominant function.
        </p>

        <h2>{chords(f("vii m7b5"))}</h2>
        <p>
          The 7th diatonic chord is far less popular and generally only used for
          leading into {f("III").slice(1)}7.
        </p>

        <h2>{chords(f("I +"), f("V/vi + /#V"))}</h2>
        <p>
          These are often used as passing chords between {f("I").slice(1)} and{" "}
          {f("vi").slice(1)}m to harmonize the note {f("#v").slice(1)}.
        </p>

        <h2>{chords(f7("#i dim7"), f7("#iv dim7"), f7("#v dim7"))}</h2>
        <p>
          These are <strong>secondary leading-tone diminished</strong> chords,
          functioning as {rom("vii")} of the chords {rom("ii")}, {rom("V")}, and{" "}
          {rom("vi")}.
        </p>
        <p>
          {f("#ii").slice(1)}dim7 is sometimes called a "passing-tone"
          diminished 7th with {f("ii").slice(1)} passing to {f("iii").slice(1)}
          —or vice versa—but it may be clearer to think of it as an inversion of{" "}
          {f("#iv").slice(1)}dim7.
        </p>

        <SeventhTeaser sevenths={sevenths} setSevenths={setSevenths}>
          <h2>{chords(f7("bVII maj7"))}</h2>
          <p>
            This is borrowed from the mixolydian mode due to the presence of the
            note {f("vi").slice(1)}.
          </p>

          <h2>{chords(f7("V 7b9"), f7("vii dim7"))}</h2>
          <p>
            These are from the harmonic minor mode, and usually go to {rom("I")}
            .
          </p>

          <h2>{chords(f7("iv mMaj7"), f7("bVII 7#11"))}</h2>
          <p>
            The notes {f("bVI").slice(1)} and {f("iii").slice(1)} in these
            chords help evoke the altered mode <em>mixolydian b6</em>, which is
            basically aeolian but with a distinctive major 3rd.
          </p>

          <h2>{chords(f7("subV/V 7"), f7("subV 7"))}</h2>
          <p>
            These are <strong>tritone substitutes</strong> for the chords{" "}
            {rom("V/V")} and {rom("V")} typically resolving to {rom("V")} and{" "}
            {rom("I")}. In sheet music you may find the 7th notated as an
            augmented 6th.
          </p>

          <h2>{chords(f7("bII maj7"))}</h2>
          <p>
            Borrowed from phrygian, {rom("bII")} most often appears following{" "}
            {rom("V/V")}, {rom("ii")}, or {rom("bVI")} and often goes to{" "}
            {rom("I")} or {rom("V")}.
          </p>

          <h2>{chords(f("iii m7b5"), f("v m7b5"), f("vii m7"))}</h2>
          <p>
            These sometimes function as "secondary predominants", appearing
            before secondary dominants {rom("V/ii")}, {rom("V/IV")}, or{" "}
            {rom("V/vi")} (or before their equivalent secondary leading-tone
            diminished chords).
          </p>

          <h2>
            {chords(f("V 7b9"), f("V 7#9"), f("subV 7b5"))}
            <span className="sep"> . </span> etc.
          </h2>
          <p>
            In jazz, dominant 7th chords are often "altered" with their 5th
            and/or 9th chord tones lowered or raised. These are just some
            examples.
          </p>
        </SeventhTeaser>
      </section>

      <footer>
        <p>
          By Steve Clay.{" "}
          <a href="https://twitter.com/mrclay_org">@mrclay_org</a>. (
          <a href="https://github.com/mrclay/piano-record/blob/main/src/pages/CommonChordsPage.tsx">
            Source code
          </a>
          )
        </p>
      </footer>
    </div>
  );
}

export default CommonChordsPage;

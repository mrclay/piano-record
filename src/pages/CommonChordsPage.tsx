import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Key from "../music-theory/Key";
import { majorKeys } from "../music-theory/constants";
import Note from "../music-theory/Note";
import "./CommonChordsPage.scss";
import Paths from "../Paths";
import CommonChords from "../common-chords/CommonChords";
import { useStore } from "../store";

Note.unicodeAccidentals = true;

const keys: Key[] = [
  ...majorKeys.map(name => Key.major(name)),
  // ...minorKeys.map(name => Key.minor(name)),
];

interface ParamsMatch {
  urlKey?: string;
}

function CommonChordsPage() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [showSelect, setShowSelect] = useState(false);
  const [relative, setRelative] = useStore.relative();
  const [sevenths, setSevenths] = useStore.sevenths();
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

  return (
    <div className="CC">
      <div className="head-flex">
        <div>
          <h1 className="h2">
            The Common Chords of <b>{keyName}</b>
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
                change key
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
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={relative}
                onChange={e => setRelative(e.target.checked)}
              />
              Show Roman numerals
            </label>
          </div>
        </form>
      </section>

      <hr />

      <CommonChords musicKey={key} />

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

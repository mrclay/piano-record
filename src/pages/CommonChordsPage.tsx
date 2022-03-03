import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Key from "../music-theory/Key";
import { majorKeys } from "../music-theory/constants";
import Note from "../music-theory/Note";
import Paths from "../Paths";
import CommonChords, { Intro } from "../common-chords/CommonChords";
import { useStore } from "../store";
import "./CommonChordsPage.scss";
import { getInterval } from "../music-theory/Interval";

Note.unicodeAccidentals = true;

const keys: Key[] = [
  ...majorKeys.map(name => Key.major(name)),
  // ...minorKeys.map(name => Key.minor(name)),
];

interface ParamsMatch {
  urlKey?: string;
}

const uCase = (qual: string) => qual.replace(/^m/, "M");

function CommonChordsPage() {
  const [relative, setRelative] = useStore.relative();
  const [sevenths, setSevenths] = useStore.sevenths();
  const [offset, setOffset] = useStore.offset();
  const navigate = useNavigate();
  const { urlKey = "" }: ParamsMatch = useParams();
  const musicKey = keys.find(el => el.toString().replace(" ", "-") === urlKey);

  useEffect(() => {
    if (musicKey) {
      const { deltaSemitones } = getInterval(
        "C",
        musicKey.getTonicNote().toString()
      );
      setOffset(deltaSemitones < 6 ? deltaSemitones : deltaSemitones - 12);

      const quality = uCase(musicKey.getQuality());
      const keyName = musicKey.toString();
      document.title = `The Common Chords of ${quality} Keys: ${keyName}`;
    }
  }, [musicKey]);

  if (!musicKey) {
    navigate(Paths.commonChordsPrefix("/C-major"));
    return null;
  }

  return (
    <div className="CC">
      <div className="head-flex">
        <div>
          <h1 className="h2">
            The Common Chords of {uCase(musicKey.getQuality())} Keys
          </h1>
        </div>
        <div>
          <form className="form-inline">
            <select
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
              defaultValue={musicKey.toString()}
            >
              <optgroup label="major">
                {keys
                  .filter(key => key.getQuality() === "major")
                  .map(key => key + "")
                  .map(name => (
                    <option key={name}>{name}</option>
                  ))}
              </optgroup>
              <optgroup label="minor">
                <option disabled>Coming soon!</option>
              </optgroup>
            </select>
          </form>
        </div>
      </div>

      <section>
        <Intro musicKey={musicKey} offset={offset} />
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

      <CommonChords musicKey={musicKey} offset={offset} />

      <footer>
        <p>
          By Steve Clay.{" "}
          <a href="https://twitter.com/mrclay_org">@mrclay_org</a>. (
          <a href="https://github.com/mrclay/piano-record/blob/main/src/common-chords/CommonChords.tsx">
            Source code
          </a>
          )
        </p>
      </footer>
    </div>
  );
}

export default CommonChordsPage;

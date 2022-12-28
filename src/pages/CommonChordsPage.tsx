import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Key from "../music-theory/Key";
import {
  Char,
  majorKeys,
  minorKeys,
  ThirdQuality,
} from "../music-theory/constants";
import Note from "../music-theory/Note";
import Paths from "../Paths";
import { useStore } from "../store";
import "./CommonChordsPage.scss";
import { getInterval } from "../music-theory/Interval";
import { useCommonChordsQuery } from "../common-chords/useCommonChordsQuery";
import { Intro } from "../common-chords/Intro";
import MajorKeyChords from "../common-chords/MajorKeyChords";
import MinorKeyChords from "../common-chords/MinorKeyChords";
import Template from "./Template";

Note.unicodeAccidentals = true;

const keys: Key[] = [
  ...majorKeys.map(name => Key.major(name)),
  ...minorKeys.map(name => Key.minor(name)),
];

interface ParamsMatch {
  urlKey?: string;
}

const uCase = (qual: string) => qual.replace(/^m/, "M");

function CommonChordsPage() {
  const { relative, sevenths, qs, setRelative, setSevenths } =
    useCommonChordsQuery();

  const [offset, setOffset] = useStore.offset();
  const navigate = useNavigate();
  const { urlKey = "" }: ParamsMatch = useParams();
  const musicKey = keys.find(el => {
    const name = el.toString(true).replace(" ", "-");
    return name === urlKey;
  });

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
    } else {
      let m = location.hash.match(/^#-(major|minor)/);
      if (m) {
        const newPath = `/${urlKey}${Char.SHARP}-${m[1]}`;

        // navigate() fails due to the hash. (shrugs)
        location.href = Paths.commonChordsPrefix(newPath);
        return;
      }

      if (/^[A-G]b/.test(urlKey)) {
        navigate(
          Paths.commonChordsPrefix(`/${urlKey.replace("b", Char.FLAT)}`)
        );
        return;
      }

      navigate(Paths.commonChordsPrefix("/C-major"));
    }
  }, [musicKey, setOffset]);

  if (!musicKey) {
    return null;
  }

  return (
    <Template
      showLimitations={false}
      title={[
        <>The Common Chords of {uCase(musicKey.getQuality())} Keys</>,
        <form className="form-inline">
          <select
            className="form-control"
            onChange={e => {
              const newKey = keys.find(el => el.toString() === e.target.value);
              if (newKey) {
                navigate(
                  Paths.commonChordsPrefix(
                    `/${newKey.toString(true).replace(" ", "-")}${qs}`
                  )
                );
              }
            }}
            defaultValue={musicKey.toString()}
          >
            <optgroup label="major">
              {keys
                .filter(key => key.getQuality() === ThirdQuality.MAJOR)
                .map(key => key + "")
                .map(name => (
                  <option key={name}>{name}</option>
                ))}
            </optgroup>
            <optgroup label="minor">
              {keys
                .filter(key => key.getQuality() === ThirdQuality.MINOR)
                .map(key => key + "")
                .map(name => (
                  <option key={name}>{name}</option>
                ))}
            </optgroup>
          </select>
        </form>,
      ]}
      intro={<Intro musicKey={musicKey} offset={offset} />}
    >
      <div className="CC">
        <section>
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

        {musicKey.getQuality() === ThirdQuality.MAJOR ? (
          <MajorKeyChords musicKey={musicKey} offset={offset} />
        ) : (
          <MinorKeyChords musicKey={musicKey} offset={offset} />
        )}
      </div>
    </Template>
  );
}

export default CommonChordsPage;

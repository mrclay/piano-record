import React, { useEffect, useMemo, useState } from "react";
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
import { Content900, H1, HeadingNav, HrFinal } from "../ui/Common";
import { TourContext, useTour } from "../TourContext";

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
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { sevenths, qs, setSevenths } = useCommonChordsQuery();

  const [offset, setOffset] = useStore.offset();
  const [sequencer] = useStore.sequencer();
  const [recorder] = useStore.recorder();
  const { tourState, tourDispatch } = useTour();
  const tourContext = useMemo(
    () => ({
      tourState,
      tourDispatch,
      activeItem: tourState.items[tourState.activeIdx],
    }),
    [tourState, tourDispatch]
  );

  const navigate = useNavigate();
  const { urlKey = "" }: ParamsMatch = useParams();
  const musicKey = keys.find(el => {
    const name = el.toString(true).replace(" ", "-");
    return name === urlKey;
  });

  useEffect(() => {
    // Handle react dev mode calling this twice
    if (!isFirstRender) {
      return;
    }

    setIsFirstRender(false);
  }, []);

  useEffect(() => {
    if (!isFirstRender) {
      tourDispatch({ type: "reset" });
    }

    sequencer.stop();
    recorder.stop();

    if (musicKey) {
      const { deltaSemitones } = getInterval("C", musicKey.getTonicNote());
      setOffset(deltaSemitones < 8 ? deltaSemitones : deltaSemitones - 12);

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
  }, [musicKey]);

  if (!musicKey) {
    return null;
  }

  return (
    <TourContext.Provider value={tourContext}>
      <HeadingNav />

      <Content900>
        <div className="d-flex align-items-center">
          <H1>The Common Chords of {uCase(musicKey.getQuality())} Keys</H1>

          <form className="form-inline ms-4">
            <select
              className="form-control"
              onChange={e => {
                const newKey = keys.find(
                  el => el.toString() === e.target.value
                );
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
          </form>
        </div>
      </Content900>
      <Content900>
        <Intro musicKey={musicKey} offset={offset} />
      </Content900>

      <div className="CC">
        <section>
          <hr className="hr-thin" />

          <form className="my-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={sevenths}
                onChange={e => setSevenths(e.target.checked)}
                id="showRomans"
              />
              <label className="form-check-label" htmlFor="showRomans">
                Show 7ths on chords. (You don't have to play them.)
              </label>
            </div>
          </form>
        </section>

        <hr className="hr-thin" />

        {musicKey.getQuality() === ThirdQuality.MAJOR ? (
          <MajorKeyChords musicKey={musicKey} offset={offset} />
        ) : (
          <MinorKeyChords musicKey={musicKey} offset={offset} />
        )}
      </div>

      <HrFinal />
    </TourContext.Provider>
  );
}

export default CommonChordsPage;

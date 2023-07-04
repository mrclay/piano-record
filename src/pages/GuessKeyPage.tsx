import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { debounce } from "throttle-debounce";

import { BottomCenterAd } from "../ui/Ads";
import Saver from "../ui/Saver";
import Paths from "../Paths";
import { parseChord, ParsedChord } from "../music-theory/Chord";
import { scoreProgression } from "../music-theory/opinion/scoring";
import { displayDelta } from "../music-theory/opinion/score-boosts";
import { Content900, H1, HeadingNav, HrFinal } from "../ui/Common";

interface MatchItems {
  data?: string;
}

const DEFAULT_VALUE = "";

export default function GuessKeyPage() {
  const params: MatchItems = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [value, setValue] = useState(searchParams.get("c") || DEFAULT_VALUE);

  // Debounced value
  const [dValue, setDValue] = useState(DEFAULT_VALUE);

  const chords = useMemo(() => {
    return dValue
      .trim()
      .replace(/ [-|] /g, " ")
      .split(/\s+/)
      .map(str => parseChord(str) || str);
  }, [dValue]);
  const foundChords = useMemo(
    () => chords.filter((el): el is ParsedChord => typeof el === "object"),
    [chords]
  );
  // Savable representation
  const normalized = foundChords
    .map(el => el.root.toString(false) + el.givenSymbol)
    .join(" ");

  const updateDValue = useCallback(
    debounce(250, v => setDValue(v)),
    [setDValue]
  );

  useEffect(() => {
    updateDValue(value);
  }, [value]);

  const scores = useMemo(() => {
    const rows = scoreProgression(foundChords)
      .filter(s => s.total > 0)
      .map(row => ({ ...row, hasTopScore: false }));
    if (rows.length) {
      const top = rows[0].total;
      rows.forEach(row => (row.hasTopScore = row.total === top));
    }
    return rows;
  }, [foundChords]);

  return (
    <>
      <HeadingNav />

      <Content900>
        <H1>Guess the Key</H1>

        <p>Type some chords and we'll provide a list of potential keys.</p>
        <p>
          <input
            type="text"
            value={value}
            placeholder="Enter chords here"
            className="form-control"
            onChange={e => setValue(e.target.value)}
          />
        </p>

        <div className="ps-4 pb-4 float-end">
          <button
            type="button"
            id="save"
            disabled={Boolean((searchParams.get("c") || "") === normalized)}
            className="btn btn-primary btn-lg"
            onClick={() =>
              setSearchParams(new URLSearchParams({ c: normalized }))
            }
          >
            <i className="fa fa-floppy-o" aria-hidden="true"></i>{" "}
            <span>Save</span>
          </button>
        </div>

        <p>
          <strong>Tips:</strong> If you have a major triad that sounds basically
          the same with a maj7, enter it as a maj7. If you have a chord with a
          "bluesy" (non-functional) b7, try leaving it off. If a chord is used a
          lot, enter it multiple times.
        </p>
        <p>
          This algorithm doesn't really understand progressions. It scores each
          chord separately based on Steve's intuition around how commonly
          they're used (encoded in these{" "}
          <a href="https://github.com/mrclay/piano-record/blob/main/src/music-theory/opinion/chord-usage.ts">
            major and minor key lookup tables
          </a>
          ). This is not based on any <em>real</em> research data.
        </p>

        {Boolean(
          foundChords.length && chords.length !== foundChords.length
        ) && (
          <div className="alert alert-danger" role="alert">
            <strong>These chords could not be parsed:</strong>
            {chords
              .filter((el): el is string => typeof el === "string")
              .map(str => (
                <code style={{ marginLeft: "10px" }} key={str}>
                  {str}
                </code>
              ))}
          </div>
        )}
      </Content900>

      <section className="GTK">
        <div>
          <table
            className="table table-bordered"
            style={{
              opacity: foundChords.length === 0 ? 0 : 1,
            }}
          >
            <thead>
              <tr>
                <th scope="column">Key</th>
                <th scope="column">RNA</th>
                <th scope="column">Score</th>
                <th scope="column">Scoring breakdown</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((el, keyIdx) => (
                <tr
                  key={el.key.toString()}
                  className={[
                    el.hasTopScore ? "success" : "",
                    keyIdx > 4 ? "text-muted" : "",
                  ].join(" ")}
                >
                  <td>
                    <a
                      href={Paths.commonChordsPrefix(
                        `/${el.key.toString(true).replace(" ", "-")}`
                      )}
                      style={{ fontWeight: el.hasTopScore ? "600" : "inherit" }}
                    >
                      {el.key.toString(true)}
                    </a>
                  </td>
                  <td>
                    <div className="GTK__functions">
                      {el.progression.map((el2, idx) => (
                        <Fragment key={idx}>
                          {idx !== 0 && <span className="chord--sep"> - </span>}
                          {el2.type === "match" ? (
                            <span className="chord">
                              {el2.roman + " "}
                              {el.hasTopScore && (
                                <span className="fixedName">
                                  {el2.chordInKey.root + el2.given.type.symbol}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </td>
                  <td>{el.total}</td>
                  <td>
                    {el.breakdown}

                    {el.hasTopScore && (
                      <div style={{ marginTop: "0.5rem" }}>
                        {el.boosts.byChord.map((el, idx) => (
                          <div key={idx}>
                            {el.chord}:{" "}
                            {el.boosts
                              .map(sb => `${sb.rationale} ${displayDelta(sb)}`)
                              .join(", ")}
                          </div>
                        ))}
                        {el.boosts.overall.length > 0 && (
                          <div>
                            Overall:{" "}
                            {el.boosts.overall
                              .map(sb => `${sb.rationale} ${displayDelta(sb)}`)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {Boolean(params.data) && (
        <section>
          <h3>Share it</h3>
          <p>
            Copy to clipboard: <Saver href={window.location.href} />
          </p>
        </section>
      )}

      <HrFinal />

      <BottomCenterAd />
    </>
  );
}

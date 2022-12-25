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

import Template from "./Template";
import { BottomRightAd } from "../ui/Ads";
import Saver from "../ui/Saver";
import Paths from "../Paths";
import { parseChord, ParsedChord } from "../music-theory/Chord";
import { scoreProgression } from "../music-theory/opinion/scoring";
import { displayDelta } from "../music-theory/opinion/score-boosts";

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
    <Template
      showLimitations={false}
      title="Guess the Key"
      intro={
        <>
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

          <div className="GTK__actions">
            <div>
              <button
                type="button"
                id="save"
                disabled={Boolean((searchParams.get("c") || "") === normalized)}
                className="btn btn-primary med-btn"
                onClick={() =>
                  setSearchParams(new URLSearchParams({ c: normalized }))
                }
              >
                <i className="fa fa-floppy-o" aria-hidden="true"></i>{" "}
                <span>Save</span>
              </button>
            </div>
          </div>
          <p>
            <strong>Caveats:</strong> This algorithm doesn't understand
            progressions and only considers order by nudging the score based on
            aspects of the first chord. It's mostly scoring based on Steve's
            intuition around how commonly certain chords are used, encoded in
            these{" "}
            <a href="https://github.com/mrclay/piano-record/blob/main/src/music-theory/Chord.ts#L98-L160">
              major and minor key lookup tables
            </a>
            . Not any <em>real</em> data. If you have a chord with a "bluesy"
            (non-functional) b7, try leaving it off; it undervalues the
            likelihood that E7 A7 E7 is in E major.
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
        </>
      }
    >
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
                <th scope="column">Functions</th>
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

        <BottomRightAd />
      </section>

      {Boolean(params.data) && (
        <section>
          <h3>Share it</h3>
          <p>
            Copy to clipboard: <Saver href={window.location.href} />
          </p>
        </section>
      )}
    </Template>
  );
}

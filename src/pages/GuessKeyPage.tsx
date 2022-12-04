import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router";
// import { useLocation, useSearchParams } from "react-router-dom";
import { debounce } from "throttle-debounce";

import Template from "./Template";
import { BottomRightAd } from "../ui/Ads";
import Saver from "../ui/Saver";
import { Chord, parseChord, scoreProgression } from "../music-theory/Chord";
import Paths from "../Paths";

interface MatchItems {
  data?: string;
}

const DEFAULT_VALUE = "";

export default function GuessKeyPage() {
  // const navigate = useNavigate();
  const params: MatchItems = useParams();
  // const { pathname } = useLocation();
  // const [searchParams] = useSearchParams();

  const [value, setValue] = useState(DEFAULT_VALUE);

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
    () => chords.filter((el): el is Chord => typeof el === "object"),
    [chords]
  );

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
      .map(row => ({
        ...row,
        hasTopScore: false,
      }));
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
          <p>
            Type some chords and this tool will attempt to guess the key. (Beta!
            Major keys only for the moment.)
          </p>

          <p>
            <input
              type="text"
              value={value}
              placeholder="Type chords here"
              className="form-control"
              onChange={e => setValue(e.target.value)}
            />
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
                <th scope="column">Score breakdown</th>
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
                    {el.scores.map((el2, idx) => (
                      <Fragment key={idx}>
                        {idx !== 0 && " - "}
                        {el2.func && el2.chordInKey ? (
                          <span className="chord">
                            {el2.func + " "}
                            {el.hasTopScore && (
                              <span className="fixedName">
                                {el2.chordInKey.root + el2.given.typeStr}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </Fragment>
                    ))}
                  </td>
                  <td>{el.total}</td>
                  <td>{el.breakdown}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {foundChords.length !== 0 && (
            <>
              <h2 className="h4">Scoring notes</h2>
              <p>
                Scoring is subjectively based on{" "}
                <a href="https://github.com/mrclay/piano-record/blob/main/src/music-theory/Chord.ts#L98-L160">
                  major and minor key lookup tables
                </a>{" "}
                containing numbers based on how often the chord is used in the
                key.{" "}
                <em>
                  These are based on my study of songs for 25+ years, not any
                  real data.
                </em>
                It naively gives each user-provided chord the best score it can
                find in the tables (and an extra point if the user has given a
                7th chord and it matches).
              </p>
              <p>
                It does not (yet) consider the order of chords at all. A better
                algorithm might identify common changes and award additional
                points, or remove them for "strange" changes. The next step here
                is to set up a test suite where contributors can add songs.
              </p>
            </>
          )}
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

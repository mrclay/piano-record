import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router";
import { useLocation, useSearchParams } from "react-router-dom";
import { debounce } from "throttle-debounce";

import Template from "./Template";
import { BottomRightAd } from "../ui/Ads";
import Saver from "../ui/Saver";
import { Chord, parseChord, scoreChord } from "../music-theory/Chord";
import Key from "../music-theory/Key";
import { majorKeys } from "../music-theory/constants";

interface MatchItems {
  data?: string;
}

export default function GuessKeyPage() {
  const navigate = useNavigate();
  const params: MatchItems = useParams();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const [value, setValue] = useState("");

  // Debounced value
  const [dValue, setDValue] = useState("");

  const chords = useMemo(() => {
    return dValue
      .trim()
      .replace(/ [-|] /g, " ")
      .split(/\s+/)
      .map(str => parseChord(str));
  }, [dValue]);
  const foundChords = useMemo(
    () => chords.filter((el): el is Chord => el !== null),
    [chords]
  );

  const updateDValue = useCallback(
    debounce(250, v => setDValue(v)),
    [setDValue]
  );

  useEffect(() => {
    updateDValue(value);
  }, [value]);

  const scores = useMemo(
    () =>
      majorKeys
        .map(noteName => {
          const key = Key.major(noteName);
          const scores = foundChords.map(el => scoreChord(key, el));
          let breakdown = scores.map(el => el.score).join(" + ");
          const hasTonic = foundChords.some(
            el => el.root.getChromatic() === key.getTonicNote().getChromatic()
          );
          if (hasTonic) {
            breakdown += " + 10 for the tonic";
          }
          const total = scores.reduce((acc, curr) => acc + curr.score, 0);

          return {
            key: key.toString(),
            total: total + (hasTonic ? 10 : 0),
            breakdown,
            scores,
          };
        })
        .sort((a, b) => {
          if (a.total === b.total) {
            return 0;
          }
          return a.total > b.total ? -1 : 1;
        }),
    [foundChords]
  );

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

          <div
            style={{
              opacity: foundChords.length === 0 ? 0 : 1,
            }}
          >
            <h3>Parsed chords</h3>
            <pre>
              {chords.map((el, idx) => (
                <Fragment key={idx}>
                  {idx !== 0 && " - "}
                  {el === null && <span>N/A</span>}
                  {el !== null && <b>{el.root + el.type.symbol}</b>}
                </Fragment>
              ))}
            </pre>
          </div>
        </>
      }
    >
      <section className="GTK">
        <table
          className="table table-bordered"
          style={{
            opacity: foundChords.length === 0 ? 0 : 1,
          }}
        >
          <thead>
            <tr>
              <th scope="column">Key</th>
              <th scope="column">Score</th>
              <th scope="column">Score breakdown</th>
              <th scope="column">Functions</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((el, keyIdx) => (
              <tr key={el.key} className={keyIdx === 0 ? "success" : ""}>
                <td>{el.key}</td>
                <td>{el.total}</td>
                <td>{el.breakdown}</td>
                <td>
                  {el.scores.map((el2, idx) => (
                    <Fragment key={idx}>
                      {idx !== 0 && " - "}
                      {el2.func ? (
                        <b>{el2.func}</b>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </Fragment>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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

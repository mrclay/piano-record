import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { debounce } from "throttle-debounce";

import { Content900, H1, HeadingNav, HrFinal } from "../ui/Common";
import GuessKeyTable from "../ui/GuessKeyTable";
import Doughnut from "../ui/Doughnut";
import Saver from "../ui/Saver";
import { parseChord, ParsedChord } from "../music-theory/Chord";
import Key from "../music-theory/Key";
import {
  BoostCollection,
  ScoredChord,
  scoreProgression,
} from "../music-theory/opinion/scoring";
import { Boosts } from "../music-theory/opinion/score-boosts";

interface MatchItems {
  data?: string;
}

export interface GuessKeyScore {
  hasTopScore: boolean;
  key: Key;
  total: number;
  breakdown: string;
  progression: ScoredChord[];
  boosts: BoostCollection;
}

const DEFAULT_VALUE = "";

export default function GuessKeyPage() {
  const params: MatchItems = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [value, setValue] = useState(searchParams.get("c") || DEFAULT_VALUE);

  // Debounced value
  const [dValue, setDValue] = useState(DEFAULT_VALUE);

  const [highlightedScore, setHighlightedScore] =
    useState<GuessKeyScore | null>(null);

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

  const scores: GuessKeyScore[] = useMemo(() => {
    const rows = scoreProgression(foundChords)
      .filter(
        el =>
          el.total >= 10 &&
          el.boosts.overall.includes(Boosts.hasDiatonicOrDominant)
      )
      .map(row => ({ ...row, hasTopScore: false }));
    if (rows.length) {
      const top = rows[0].total;
      rows.forEach(row => (row.hasTopScore = row.total === top));
    }

    setHighlightedScore(rows[0]);
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
          {scores.length > 0 && (
            <div className="d-flex">
              <div style={{ flex: "0 15rem" }}>
                <Doughnut
                  scores={scores}
                  onClick={score => {
                    if (score) {
                      setHighlightedScore(score);
                    }
                  }}
                  onHover={score => {
                    if (score) {
                      setHighlightedScore(score);
                    }
                  }}
                />
              </div>

              <GuessKeyTable
                classes="flex-grow-1"
                scores={[highlightedScore || scores[0]]}
              />
            </div>
          )}
        </div>
      </section>

      <Content900>
        <h3 className="mt-4">Full results</h3>
        <GuessKeyTable scores={scores} />
      </Content900>

      {Boolean(params.data) && (
        <section>
          <h3>Share it</h3>
          <p>
            Copy to clipboard: <Saver href={window.location.href} />
          </p>
        </section>
      )}

      <HrFinal />
    </>
  );
}

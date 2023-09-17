import React, { useCallback, useEffect, useMemo, useState } from "react";
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

export interface GuessKeyScore {
  hasTopScore: boolean;
  key: Key;
  total: number;
  breakdown: string;
  progression: ScoredChord[];
  boosts: BoostCollection;
}

export default function GuessKeyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlValue = searchParams.get("c") || "";

  const [initMode, setInitMode] = useState(urlValue === "");

  const [value, setValue] = useState(urlValue || "");
  // Debounced value
  const [dValue, setDValue] = useState("");

  const [highlightedScore, setHighlightedScore] =
    useState<GuessKeyScore | null>(null);

  useEffect(() => {
    if (!initMode && urlValue === "") {
      // Reset
      setInitMode(true);
      setValue("");
      setDValue("");
      setHighlightedScore(null);
    }
  }, [urlValue]);

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

  const canSave = initMode ? true : searchParams.get("c") !== normalized;
  const save = () => {
    setInitMode(false);
    setSearchParams({ c: normalized });
  };

  const hasScores = !initMode && scores.length > 0;

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
            onKeyUp={e => {
              if (canSave && e.key === "Enter") {
                save();
              }
            }}
          />
        </p>

        <div className="ps-4 pb-4 float-end">
          <button
            type="button"
            id="save"
            disabled={!canSave}
            className="btn btn-primary btn-lg"
            onClick={save}
          >
            <i className="fa fa-floppy-o" aria-hidden="true"></i>{" "}
            <span>{initMode ? "Score" : "Save"}</span>
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

      <Content900
        className={`GTK__results ${hasScores && "GTK__results--populated"}`}
      >
        {hasScores && (
          <>
            <div className="GTK__pie_line">
              <div>
                <Doughnut
                  scores={scores}
                  onClick={score => {
                    if (score) {
                      setHighlightedScore(score);
                      const table = document.querySelector(
                        ".GTK__pie_line > table"
                      );
                      if (table) {
                        const viewportHeight =
                          window.innerHeight ||
                          document.documentElement.clientHeight;
                        if (
                          table.getBoundingClientRect().bottom -
                            viewportHeight >
                          0
                        ) {
                          table.scrollIntoView(false);
                        }
                      }
                    }
                  }}
                  onHover={score => {
                    if (score) {
                      setHighlightedScore(score);
                    }
                  }}
                />
              </div>

              <GuessKeyTable single scores={[highlightedScore || scores[0]]} />
            </div>

            <h3 className="mt-4">Full results</h3>
            <GuessKeyTable scores={scores} />
          </>
        )}

        {Boolean(value) && (
          <section className="mt-4">
            <h3>Share it</h3>
            <p>
              Copy to clipboard: <Saver href={window.location.href} />
            </p>
          </section>
        )}
      </Content900>

      <HrFinal />
    </>
  );
}

import Paths from "../Paths";
import React, { Fragment } from "react";
import { displayDelta } from "../music-theory/opinion/score-boosts";
import { GuessKeyScore } from "../pages/GuessKeyPage";

interface GuessKeyTableProps {
  scores: GuessKeyScore[];
  classes?: string;
}

export default function GuessKeyTable({
  classes = "",
  scores,
}: GuessKeyTableProps) {
  return (
    <table
      className={`table table-bordered GTK__table ${classes}`}
      style={{
        opacity: scores.length === 0 ? 0 : 1,
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
  );
}

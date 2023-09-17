import Paths from "../Paths";
import React, { Fragment } from "react";
import { displayDelta } from "../music-theory/opinion/score-boosts";
import { GuessKeyScore } from "../pages/GuessKeyPage";

interface GuessKeyTableProps {
  scores: GuessKeyScore[];
  single?: boolean;
}

export default function GuessKeyTable({
  scores,
  single = false,
}: GuessKeyTableProps) {
  if (single) {
    return (
      <table className="table table-bordered GTK__table GTK__table--single">
        <tbody>
          <tr>
            <th scope="row">Key</th>
            <td>
              <KeyContent el={scores[0]} single />
            </td>
          </tr>
          <tr>
            <th scope="row">Score</th>
            <td>{scores[0].total}</td>
          </tr>
          <tr>
            <th scope="row">Scoring Breakdown</th>
            <td>
              <BreakdownContent el={scores[0]} single />
            </td>
          </tr>
          <tr>
            <th scope="row">Roman Numerals</th>
            <td>
              <RNAContent el={scores[0]} single />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="table table-bordered GTK__table">
      <thead>
        <tr>
          <th scope="column">Key</th>
          <th scope="column">Roman Numerals</th>
          <th scope="column">Score</th>
          <th scope="column">Scoring Breakdown</th>
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
              <KeyContent el={el} />
            </td>
            <td>
              <RNAContent el={el} />
            </td>
            <td>{el.total}</td>
            <td>
              <BreakdownContent el={el} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface ContentProps {
  el: GuessKeyScore;
  single?: boolean;
}

const KeyContent = ({ el }: ContentProps) => (
  <a
    href={Paths.commonChordsPrefix(
      `/${el.key.toString(true).replace(" ", "-")}`
    )}
    style={{ fontWeight: el.hasTopScore ? "600" : "inherit" }}
  >
    {el.key.toString(true)}
  </a>
);

const RNAContent = ({ el, single }: ContentProps) => (
  <div className="GTK__functions">
    {el.progression.map((el2, idx) => (
      <Fragment key={idx}>
        {idx !== 0 && <span className="chord--sep"> - </span>}
        {el2.type === "match" ? (
          <span className="chord">
            {el2.roman + " "}
            {(single || el.hasTopScore) && (
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
);

const BreakdownContent = ({ el }: ContentProps) => (
  <table className="GTK__breakdown">
    <tbody>
      {el.progression.map((chord, idx) => (
        <tr key={JSON.stringify({ idx, chord })}>
          <th scope="row" className="ps-3 text-end fw-normal">
            {chord.type === "match"
              ? `${chord.given.root}${chord.given.type.symbol}`
              : `N/A`}
          </th>
          <td className="ps-3">
            {chord.usageScore}
            {chord.boosts.map(sb => (
              <Fragment key={sb.rationale}>
                {" "}
                {displayDelta(sb)}{" "}
                <span
                  className={`badge ${
                    sb.boost > 0 ? "text-bg-info" : "text-bg-dark"
                  }`}
                >
                  {sb.rationale}
                </span>
              </Fragment>
            ))}
          </td>
        </tr>
      ))}
      {el.boosts.overall.length > 0 && (
        <tr>
          <th scope="row" className="ps-3 text-end align-top fw-normal">
            Overall
          </th>
          <td className="ps-3">
            {el.boosts.overall.map(sb => (
              <div key={sb.rationale}>
                {displayDelta(sb)}{" "}
                <span
                  className={`badge ${
                    sb.boost > 0 ? "text-bg-info" : "text-bg-dark"
                  }`}
                >
                  {sb.rationale}
                </span>
              </div>
            ))}
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

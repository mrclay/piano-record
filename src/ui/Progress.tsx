import React from "react";

export default function Progress(props: { ratio: number }) {
  let style = {
    width: 100 * props.ratio + "%",
  };
  let percentage = Math.round(100 * props.ratio);

  return (
    <div className="progress">
      <div
        id="progress"
        className="progress-bar"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        style={style}
      >
        <span className="sr-only">
          <span className="progress-percentage">{percentage}</span>% Complete
        </span>
      </div>
    </div>
  );
}

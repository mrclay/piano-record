import React from "react";

export interface ProgressProps {
  ratio: number;
  steps?: [active: number, total: number];
}

export default function Progress({ ratio, steps }: ProgressProps) {
  const percentage = Math.round(
    (steps ? (steps[0] + 1) / steps[1] : ratio) * 100
  );
  const style = {
    transition: "width 250ms",
    width: percentage + "%",
  };

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

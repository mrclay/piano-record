import React from "react";

import Progress, { ProgressProps } from "./Progress";

interface PreviewProps {
  handlePlay(): void;
  handleStop(): void;
  progress: ProgressProps;
  isPlaying: boolean;
  isWaiting: boolean;
}

export default function Preview({
  handlePlay,
  handleStop,
  progress,
  isPlaying,
  isWaiting,
}: PreviewProps) {
  if (isPlaying) {
    return (
      <button
        type="button"
        onClick={handleStop}
        id="preview"
        className="btn btn-default med-btn"
      >
        <i className="fa fa-stop" aria-hidden="true" />{" "}
        <Progress {...progress} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      id="preview"
      disabled={isWaiting}
      className="btn btn-default med-btn"
    >
      <i className="fa fa-play" aria-hidden="true" /> <span>Play</span>
    </button>
  );
}

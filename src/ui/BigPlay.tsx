import React from "react";

import Progress from "./Progress";

interface PlayProps {
  handlePlay(): void;
  handleStop(): void;
  isPlaying: boolean;
  isWaiting: boolean;
  progress: number;
}

export default function Play({
  handlePlay,
  handleStop,
  progress,
  isPlaying,
  isWaiting,
}: PlayProps) {
  function renderIcon() {
    if (isPlaying) {
      return <Progress ratio={progress} />;
    }

    return <i className="fa fa-stop" aria-hidden="true" />;
  }

  if (isPlaying) {
    return (
      <button
        type="button"
        onClick={handleStop}
        id="big-play"
        className="btn btn-info med-btn"
        disabled={isWaiting}
      >
        {renderIcon()}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      id="big-play"
      disabled={isWaiting}
      className="btn btn-info med-btn"
    >
      <i className="fa fa-play" aria-hidden="true" />
    </button>
  );
}

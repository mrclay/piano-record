import React from "react";

import * as C from "../constants";
import Progress from "./Progress";

interface PlayProps {
  handlePlay(): void;
  handleStop(): void;
  progress: number;
  state: string;
  waiting: boolean;
}

export default function Play({
  handlePlay,
  handleStop,
  progress,
  state,
  waiting,
}: PlayProps) {
  function renderIcon() {
    if (progress !== undefined) {
      return <Progress ratio={progress} />;
    }

    return <i className="fa fa-stop" aria-hidden="true" />;
  }

  if (state === C.PLAYING) {
    return (
      <button
        type="button"
        onClick={handleStop}
        id="big-play"
        className="btn btn-default"
        disabled={waiting}
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
      disabled={waiting}
      className="btn btn-default"
    >
      <i className="fa fa-play" aria-hidden="true" />
    </button>
  );
}

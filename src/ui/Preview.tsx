import React from "react";

import * as C from "../constants";
import Progress from "./Progress";

interface PreviewProps {
  handlePlay(): void;
  handleStop(): void;
  progress: number;
  state: string;
  waiting: boolean;
}

export default function Preview({
  handlePlay,
  handleStop,
  progress,
  state,
  waiting,
}: PreviewProps) {
  if (state === C.PLAYING) {
    return (
      <button
        onClick={handleStop}
        id="preview"
        className="btn btn-default med-btn"
      >
        <i className="fa fa-stop" aria-hidden="true" />{" "}
        <Progress ratio={progress} />
      </button>
    );
  }

  return (
    <button
      onClick={handlePlay}
      id="preview"
      disabled={waiting}
      className="btn btn-default med-btn"
    >
      <i className="fa fa-play" aria-hidden="true" /> <span>Preview</span>
    </button>
  );
}

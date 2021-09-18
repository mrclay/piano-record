import React from "react";

import * as C from "../constants";
import Progress from "./Progress";

export default function Play(props) {
  function renderIcon(progress) {
    if (progress !== undefined) {
      return <Progress ratio={progress} />;
    }

    return <i className="fa fa-stop" aria-hidden="true" />;
  }

  if (props.state === C.PLAYING) {
    return (
      <button
        onClick={props.handleStop}
        id="big-play"
        className="btn btn-default"
        disabled={props.waiting}
      >
        {renderIcon(props.progress)}
      </button>
    );
  }

  return (
    <button
      onClick={props.handlePlay}
      id="big-play"
      disabled={props.waiting}
      className="btn btn-default"
    >
      <i className="fa fa-play" aria-hidden="true" />
    </button>
  );
}

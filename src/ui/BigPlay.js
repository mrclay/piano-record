import * as C from "../constants";
import Progress from "./Progress";
import React from 'react';

export default function Play(props) {
  if (props.state === C.PLAYING) {
    let icon;
    if (props.progress !== undefined) {
      icon = <Progress ratio={props.progress} />;
    } else {
      icon = <i className="fa fa-stop" aria-hidden="true" />;
    }

    return (
      <button
          onClick={props.handleStop}
          id="big-play"
          className="btn btn-default"
          disabled={props.waiting}
        >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={props.handlePlay}
      id="big-play"
      disabled={props.waiting}
      className="btn btn-default">
      <i className="fa fa-play" aria-hidden="true" />
    </button>
  );
};

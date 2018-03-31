import React from 'react';

import * as C from "../constants";
import Progress from "./Progress";

export default function Preview(props) {
  if (props.state === C.PLAYING) {
    return (
      <button
        onClick={props.handleStop}
        id="preview"
        className="btn btn-default med-btn">
        <i className="fa fa-stop" aria-hidden="true"/> <Progress ratio={props.progress} />
      </button>
    );
  }

  return (
    <button
      onClick={props.handlePlay}
      id="preview"
      disabled={props.waiting}
      className="btn btn-default med-btn">
      <i className="fa fa-play" aria-hidden="true"/> <span>Preview</span>
    </button>
  );
};

import React from 'react';
import {STOPPED} from './constants';

export default function Play(props) {
  if (props.playState === STOPPED) {
    return (
      <button
        onClick={props.handlePlay}
        id="big-play"
        className="btn btn-default">
        <i className="fa fa-play" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={props.handleStop}
      id="big-play"
      className="btn btn-default">
      <i className="fa fa-stop" aria-hidden="true" />
    </button>
  );
};

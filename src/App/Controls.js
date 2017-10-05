import React from 'react';
import Play from './Play';
import Record from './Record';

export default function Controls(props) {
  return (
    <div className="btn-group" role="group">
      <Play
        handlePlay={props.handlePlay}
        handleStop={props.handleStop}
        playState={props.playState}
        hasOperations={props.hasOperations}
      />
      <button onClick={props.handleReset} id="reset" className="btn btn-info">
        <i className="fa fa-star" aria-hidden="true" /> <span>New</span>
      </button>
      <Record
        playState={props.playState}
      />
    </div>
  );
};

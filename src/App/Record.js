import React from 'react';

export default function Record(props) {

  return (
    <span id="record" className={props.playState}>
      <i className="fa fa-circle" aria-hidden="true" /> <span>Recording...</span>
    </span>
  );
};

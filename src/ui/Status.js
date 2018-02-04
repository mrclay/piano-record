import React from 'react';

import * as C from "../constants";

export default function Status({waiting, state}) {
  if (waiting) {
    return (
      <div id="status" className='ready'>Ready!!!</div>
    );
  }
  if (state === C.PLAYING) {
    return (
      <div id="status" className='playing'>Playback...</div>
    );
  }
  if (state === C.RECORDING) {
    return (
      <div id="status" className='recording'><i className="fa fa-circle" aria-hidden="true" /> Recording...</div>
    );
  }

  return (
    <div id="status" className='idle'>&nbsp;</div>
  );
}

import * as C from "../constants";
import React from 'react';

export default function Status(props) {
  if (props.waiting) {
    return (
      <div id="status" className='ready'>Ready!!!</div>
    );
  }
  if (props.state === C.PLAYING) {
    return (
      <div id="status" className='playing'>Playback...</div>
    );
  }
  if (props.state === C.RECORDING) {
    return (
      <div id="status" className='recording'><i className="fa fa-circle" aria-hidden="true" /> Recording...</div>
    );
  }

  return (
    <div id="status" className='idle'>&nbsp;</div>
  );
}

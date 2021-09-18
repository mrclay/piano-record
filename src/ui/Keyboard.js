import React from 'react';

import {RANGE} from '../constants';

export default function Keyboard({ activeKeys, onKeyClick }) {
  const handleKey = e => {
    e.preventDefault();

    const target = e.target;
    if (!target.dataset.note) {
      return;
    }

    const note = parseInt(target.dataset.note, 10);

    if (onKeyClick) {
      onKeyClick(note);
    }
  };

  const renderKey = ({ note, left, active }) => {
    return (
      <span
        key={note}
        data-note={note}
        className={active ? 'active' : ''}
        style={left && {left: left + 'px'}}
      />
    );
  };

  let whites = [];
  let blacks = [];
  let note;
  let mod;
  let left = 36;
  let active;

  for (note = RANGE[0]; note <= RANGE[1]; note++) {
    mod = note % 12;
    active = !!activeKeys[note];
    if (mod === 1 || mod === 3 || mod === 6 || mod === 8 || mod === 10) {
      blacks.push(renderKey({note, left, active}));
      left += 34;
      if (mod === 3 || mod === 10) {
        // skip a key
        left += 34;
      }
    } else {
      whites.push(renderKey({note, active}));
    }
  }

  return (
    <div
      onClick={handleKey}
      id="piano"
      className={onKeyClick ? '' : 'noinput'}
    >
      <div className="white">{whites}</div>
      <div className="black">{blacks}</div>
    </div>
  );
}

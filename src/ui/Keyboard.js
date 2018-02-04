import React from 'react';

import {RANGE} from '../constants';

export default class Keyboard extends React.Component {
  handleKey = (e) => {
    e.preventDefault();

    const target = e.target;
    if (!target.dataset.note) {
      return;
    }

    const note = parseInt(target.dataset.note, 10);

    if (this.props.onKeyClick) {
      this.props.onKeyClick(note);
    }
  };

  render() {
    function renderKey(props) {
      return (
        <span
          key={props.note}
          data-note={props.note}
          className={props.active ? 'active' : ''}
          style={props.left && {left: props.left + 'px'}}
        />
      );
    }

    let whites = [], blacks = [], note, mod, left = 36, active;

    for (note = RANGE[0]; note <= RANGE[1]; note++) {
      mod = note % 12;
      active = !!this.props.activeKeys[note];
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
        onClick={this.handleKey}
        id="piano"
        className={this.props.onKeyClick ? '' : 'noinput'}
      >
        <div className="white">{whites}</div>
        <div className="black">{blacks}</div>
      </div>
    );
  }
}

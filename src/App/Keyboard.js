import {RANGE} from './constants';
import React from 'react';

export default class Keyboard extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  static renderKey(props) {
    const style = {};
    if (props.left) {
      style.left = props.left + 'px';
    }

    return (
      // eslint-disable-next-line
      <a href="#" key={props.note} data-note={props.note} style={style} />
    );
  }

  render() {
    let whites = [], blacks = [], note, mod, left = 36, key;

    for (note = RANGE[0]; note <= RANGE[1]; note++) {
      mod = note % 12;
      key = 'k' + note;
      if (mod === 1 || mod === 3 || mod === 6 || mod === 8 || mod === 10) {
        blacks.push(
          Keyboard.renderKey({
            key,
            note,
            left
          })
        );
        left += 34;
        if (mod === 3 || mod === 10) {
          // skip a key
          left += 34;
        }
      } else {
        whites.push(
          Keyboard.renderKey({
            key,
            note
          })
        );
      }
    }

    return (
      <div onClick={this.props.handleKey} id="piano">
        <div className="white">{whites}</div>
        <div className="black">{blacks}</div>
      </div>
    );
  }
}

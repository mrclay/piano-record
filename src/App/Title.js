import React from 'react';
import {DEFAULT_TITLE} from './constants';
import {RIEInput} from 'riek';

export default class Title extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: props.title || DEFAULT_TITLE,
    };
    console.log(props);
  }

  render() {
    return (
      <h1 className={this.props.saved ? 'saved' : 'unsaved'}>
        "<RIEInput
          value={this.state.text}
          propName='text'
          change={this.props.onChange}
         />"
      </h1>
    );
  }
}

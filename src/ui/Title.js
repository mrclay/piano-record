import React from 'react';
import {RIEInput} from 'riek';

import {DEFAULT_TITLE} from "../constants";

export default class Title extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: props.title,
      widget: (
        <RIEInput
          value={props.title || DEFAULT_TITLE}
          propName='title'
          change={this.handleChange}
          isDisabled={!props.onChange}
        />
      ),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.title === this.props.title
      && nextProps.onChange === this.props.onChange
    ) {
      return;
    }

    this.setState({
      title: nextProps.title,
      widget: (
        <RIEInput
          value={nextProps.title || DEFAULT_TITLE}
          propName='title'
          change={this.handleChange}
          isDisabled={!nextProps.onChange}
        />
      ),
    });
  }

  handleChange = (title) => {
    if (this.props.onChange) {
      this.props.onChange(title);
    }
  };



  render() {
    const { widget, title } = this.state;
    const className = title ? 'titled' : 'untitled';
    return (
      <h2 className={`Title ${className}`}>
        “{widget}”
      </h2>
    );
  }
}

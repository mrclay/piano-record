import React from 'react';
import {RIEInput} from 'riek';

import {DEFAULT_TITLE} from "../constants";

export default function Title(props) {
  const change = props.onChange ? props.onChange : () => {};
  const className = props.title ? 'titled' : 'untitled';

  return (
    <h2 className={`Title ${className}`}>
      “<RIEInput
        value={props.title || DEFAULT_TITLE}
        propName='title'
        change={change}
        isDisabled={!props.onChange}
      />”
    </h2>
  );
}

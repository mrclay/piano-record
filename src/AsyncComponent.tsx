import React, { Component, ComponentType } from "react";

export type Importer<T> = () => Promise<{
  default: T;
}>;

interface AsyncComponentState<T> {
  component: T | null;
}

export default function asyncComponent<T>(importComponent: Importer<T>) {
  class AsyncComponent extends Component<{}, AsyncComponentState<T>> {
    constructor(props: {}) {
      super(props);

      this.state = {
        component: null,
      };
    }

    async componentDidMount() {
      const { default: component } = await importComponent();

      this.setState({ component });
    }

    render() {
      const C = this.state.component as unknown as ComponentType;

      return C ? <C {...this.props} /> : null;
    }
  }

  return AsyncComponent;
}

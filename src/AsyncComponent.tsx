import React, { Component, ComponentType } from "react";

export type Importer<P> = () => Promise<{
  default: ComponentType<P>;
}>;

interface AsyncComponentState<P> {
  component: ComponentType<P> | null;
}

export default function asyncComponent<P extends object>(importComponent: Importer<P>) {
  class AsyncComponent extends Component<P, AsyncComponentState<P>> {
    constructor(props: P) {
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
      const C = this.state.component as unknown as ComponentType<P>;

      return C ? <C {...this.props} /> : null;
    }
  }

  return AsyncComponent;
}

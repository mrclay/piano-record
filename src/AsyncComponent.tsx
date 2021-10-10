import React, { Component, ComponentType } from "react";

export type Importer<P> = () => Promise<{
  default: ComponentType<P>;
}>;

interface AsyncComponentState<P> {
  Comp: ComponentType<P> | null;
}

export default function asyncComponent<P extends object>(
  importComponent: Importer<P>
) {
  class AsyncComponent extends Component<P, AsyncComponentState<P>> {
    constructor(props: P) {
      super(props);

      this.state = { Comp: null };
    }

    async componentDidMount() {
      const { default: Comp } = await importComponent();

      this.setState({ Comp });
    }

    render() {
      const Comp = this.state.Comp;

      return Comp ? <Comp {...this.props} /> : null;
    }
  }

  return AsyncComponent;
}

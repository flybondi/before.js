// @flow strict;
import React from 'react';

declare class BeforeComponent<TProps, TState> extends React$Component<TProps, TState> {
  default?: BeforeComponent<TProps, TState>;
  getInitialProps: (data: any) => Promise<any | Error>;
  load: () => Promise<BeforeComponent<TProps, TState>>;
}

type ComponentType = BeforeComponent<any, any> | React$ElementType | React$ComponentType<any>;

export type AsyncState = {
  Component: ?ComponentType,
  Placeholder?: ?React$Node
};

type AsyncProps = {
  loader: () => Promise<ComponentType>,
  Placeholder?: ?React$Node
};

/**
 * Returns a new React component, ready to be instantiated.
 * Note the closure here protecting Component, and providing a unique
 * instance of Component to the static implementation of `load`.
 */
export function asyncComponent({ loader, Placeholder }: AsyncProps) {
  let Component: ?ComponentType = null; // keep Component in a closure to avoid doing this stuff more than once
  return class AsyncRouteComponent extends React.Component<AsyncProps, AsyncState> {
    state = {
      Component,
      Placeholder
    };
    /**
     * Static so that you can call load against an uninstantiated version of
     * this component. This should only be called one time outside of the
     * normal render path.
     */
    static async load() {
      return loader().then(ResolvedComponent => {
        // $FlowFixMe
        Component = ResolvedComponent.default || ResolvedComponent;
        return Component;
      });
    }

    static getInitialProps(ctx: any) {
      // Need to call the wrapped components getInitialProps if it exists
      if (Component !== null) {
        // $FlowFixMe
        return Component.getInitialProps ? Component.getInitialProps(ctx) : Promise.resolve(null);
      }
    }

    componentDidMount() {
      const { Component: ComponentFromState } = this.state;
      if (ComponentFromState === null && Component === null) {
        AsyncRouteComponent.load().then(loadedComponent => {
          this.setState(prevState => ({ ...prevState, Component: loadedComponent }));
        });
      }
    }

    render() {
      const { Component: ComponentFromState, Placeholder } = this.state;
      if (ComponentFromState) {
        // $FlowFixMe
        return <ComponentFromState {...this.props} />;
      }

      if (Placeholder) {
        // $FlowFixMe
        return <Placeholder {...this.props} />;
      }

      return null;
    }
  };
}

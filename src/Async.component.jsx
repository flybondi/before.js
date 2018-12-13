// @flow strict
import type { AsyncOptions, AsyncProps, Context } from 'Async.component';
import React from 'react';
import loadable from '@loadable/component';

/**
 * Returns a new React component, ready to be instantiated.
 * Note the closure here protecting Component, and providing a unique
 * instance of Component to the static implementation of `load`.
 * @func
 * @param { loader, Placeholder } AsyncOptions
 * @returns {React$Node}
 */
export function asyncComponent({ loader, Placeholder }: AsyncOptions) {
  const LoadableComponent = loadable(loader(), { fallback: Placeholder });
  let Component = null;
  let initialProps = {};
  const AsyncRouteComponent = (props: AsyncProps) => (
    <LoadableComponent {...props} {...initialProps} />
  );

  AsyncRouteComponent.load = async () => {
    return loader().then(component => {
      Component = component.default || component;
      return Component;
    });
  };

  AsyncRouteComponent.getInitialProps = async (context: Context) =>
    Component !== null && Component.getInitialProps
      ? Component.getInitialProps(context).then(props => {
          initialProps = props;
          return props;
        })
      : Promise.resolve(null);

  return AsyncRouteComponent;
}

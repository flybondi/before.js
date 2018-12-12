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
  let Component = null; // keep Component in a closure to avoid doing this stuff more than once
  const AsyncRouteComponent = (props: AsyncProps) => Component && <Component {...props} />;

  AsyncRouteComponent.load = async () => {
    Component = loadable(loader(), { fallback: Placeholder });
    return Promise.resolve(Component);
  };

  AsyncRouteComponent.getInitialProps = async (context: Context) =>
    Component !== null && Component.getInitialProps
      ? Component.getInitialProps(context)
      : Promise.resolve(null);

  return AsyncRouteComponent;
}

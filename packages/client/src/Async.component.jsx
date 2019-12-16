// @flow strict
import type { AsyncOptions, AsyncProps, ComponentType, Context } from 'Async.component';
import React from 'react';
import { F } from 'ramda';

/**
 * Returns a new React component, ready to be instantiated.
 * Note the closure here protecting Component, and providing a unique
 * instance of Component to the static implementation of `load`.
 * @func
 * @param { loader, Placeholder } AsyncOptions
 * @returns {React.Node}
 */
export function asyncComponent({ LoadableComponent, loader }: AsyncOptions) {
  let Component = null;
  const AsyncRouteComponent = (props: AsyncProps) => {
    return <LoadableComponent {...props} />;
  };

  AsyncRouteComponent.load = async (): Promise<ComponentType<AsyncProps>> => {
    const loaderFn = (loader.requireAsync || loader).bind(loader);

    loaderFn.isReady = loader.isReady ? loader.isReady.bind(loader) : F;

    return loaderFn().then(component => {
      Component = component.default || component;

      return Component;
    });
  };

  AsyncRouteComponent.getInitialProps = async (context: Context) => {
    const component = Component || (await AsyncRouteComponent.load());
    return component.getInitialProps ? component.getInitialProps(context) : Promise.resolve(null);
  };

  return AsyncRouteComponent;
}

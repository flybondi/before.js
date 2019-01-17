// @flow strict
import type { Route } from 'ensureReady';
import { matchPath } from 'react-router-dom';
import { path } from 'ramda';
import { isClientSide } from './utils';
import { loadableReady } from '@loadable/component';

/**
 * Verify if given route has a component with an static load method.
 * @func
 * @param {object} asyncRoute route to check
 * @returns {boolean}
 */
const routeHasComponentLoad = path(['component', 'load']);

/**
 * This helps us to make sure all the async code is loaded before rendering.
 * @func
 * @param {array} routes an array of async routes
 * @param {string} pathname defaults to window.location.pathname
 */
export async function ensureReady(
  routes: Array<Route>,
  pathname: string = window.location.pathname
) {
  await Promise.all(
    routes.map(route => {
      const match = matchPath(pathname, route);
      // $FlowFixMe
      if (match && routeHasComponentLoad(route)) {
        return route.component.load();
      }
      return undefined;
    })
  );

  let data;
  if (isClientSide()) {
    const state = document.getElementById('server-app-state');
    data = state && JSON.parse(state.textContent);
  }
  return Promise.resolve(data);
}

/**
 * Wraps react root mount with @loadable.
 * @func
 * @param {function} rootFn a react mount root function
 * @returns {Promise}
 */
export function ensureClientReady(rootFn: () => void) {
  return loadableReady(rootFn);
}

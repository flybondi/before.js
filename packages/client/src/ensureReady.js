// @flow strict
import type { Route } from 'ensureReady';
import { matchPath } from 'react-router-dom';
import { path } from 'ramda';
import { findRouteByPathname, isClientSide } from './utils';
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
export async function loadCurrentRoute(
  routes: Array<Route>,
  pathname: string = window.location.pathname
) {
  let data;
  const route = findRouteByPathname(pathname, routes);

  if (route) {
    const match = matchPath(pathname, route);
    if (match && routeHasComponentLoad(route)) {
      await route.component.load();
    }
  }

  if (isClientSide()) {
    const state = document.getElementById('server-app-state');
    const textContent = path(['textContent'], state);
    try {
      data = textContent && JSON.parse(textContent);
    } catch (error) {
      console.error('There was an error parsing the server-app state', error, textContent);
    }
  }
  return Promise.resolve(data);
}

/**
 * Wraps react root mount with @loadable.
 * @func
 * @param {function} rootFn a react mount root function
 * @returns {Promise}
 */
export function ensureReady(
  routes: Array<Route>,
  rootFn: (data: ?{ [key: string]: string }) => void
) {
  return loadableReady(() => loadCurrentRoute(routes).then(rootFn));
}

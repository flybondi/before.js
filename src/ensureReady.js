// @flow strict;
import type { BeforeRoute } from './Before.component';
import { matchPath } from 'react-router-dom';
import { path } from 'ramda';
import { isClientSide } from './utils';

const routeHasComponentLoad = path(['component', 'load']);
/**
 * This helps us to make sure all the async code is loaded before rendering.
 */
export async function ensureReady(
  routes: Array<BeforeRoute<any, any>>,
  pathname: string = window.location.pathname
) {
  await Promise.all(
    routes.map(route => {
      const match = matchPath(pathname, route);
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

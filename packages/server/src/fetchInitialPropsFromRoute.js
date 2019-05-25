// @flow strict
import type { AsyncFixMeComponentType, Context, Route } from 'fetchInitialPropsFromRoutes';
import { matchPath, type Match } from 'react-router-dom';
import { complement, has, find, isNil } from 'ramda';
import { getQueryString } from '../../shared/utils';

/**
 * Check if given value is not null or undefined.
 * @func
 * @param {any} value
 * @returns {boolean}
 */
const isNotNil = complement(isNil);

/**
 * Returns a function that check if given route match with given request pathname.
 * @func
 * @param {string} pathname a request pathname
 * @returns {function} (route) => boolean
 */
const checkMatchPath = (pathname: string) => (route: Route) => isNotNil(matchPath(pathname, route));

/**
 * Returns a function that will find a route by a given request pathname.
 * @func
 * @param {string} pathname a request pathname
 * @returns {function} (routes[]) => route
 */
const findRouteByPathname = (pathname: string) => find(checkMatchPath(pathname));

/**
 * Check if the `getInitialProps` property exist in given object.
 * @func
 * @param {object} value to check if property exist
 * @returns {boolean}
 */
const hasGetInitialProps = has('getInitialProps');

/**
 * Check if the `load` property exist in given object.
 * @func
 * @param {object} value to check if property exist
 * @returns {boolean}
 */
const hasLoad = has('load');

const defaultContext = {
  location: {
    hash: '',
    search: '',
    pathname: ''
  },
  req: {
    query: {},
    originalUrl: '',
    url: '',
    path: ''
  }
};

/**
 * Retrieve the initial props from given component.
 * @param {React$PureComponent} component to fetch the initial props
 * @param {Match|Route} match react-router match or route object
 * @param {object} context
 * @returns {Promise<object|null>}
 */
export const getInitialPropsFromComponent = async (
  component: AsyncFixMeComponentType,
  match: ?Match | ?Route,
  context: Context = defaultContext
) => {
  if (match && hasGetInitialProps(component)) {
    const location = isNotNil(context.location) ? context.location : { search: '' };
    const req = isNotNil(context.req) ? context.req : { query: {} };
    try {
      if (hasLoad(component)) {
        await component.load();
      }
      return await component.getInitialProps({
        // Note: context contains the old `match` too, so it's important to overwrite that with the new `match`
        ...context,
        query: getQueryString(location, req),
        match
      });
    } catch (error) {
      console.error('There was an error while trying to retrieve the initial props', error);
      throw error;
    }
  }
  return null;
};

/**
 * Iterates over all given routes to find the route that a user is trying to render and
 * will try to fetch the intial props from it.
 * @param {array} routes an array of react-router routes
 * @param {string} pathname request pathname
 * @param {obect} context
 * @returns {object} {route, data}
 */
export async function fetchInitialPropsFromRoute(
  routes: Array<Route>,
  pathname: string = '',
  context?: Context
) {
  const route = findRouteByPathname(pathname)(routes);
  if (route) {
    const match = matchPath(pathname, route);
    const { component } = route;
    return {
      route: {
        ...match,
        ...route
      },
      data: await getInitialPropsFromComponent(component, match, context)
    };
  }

  return {
    route: {},
    data: {}
  };
}

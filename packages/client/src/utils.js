// @flow strict
import { parse } from 'query-string';
import { matchPath } from 'react-router-dom';
import { complement, find, isNil, curry } from 'ramda';
import type { QueryType } from 'Before.component';
import type { Route } from 'ensureReady';

/**
 * Check if current execution belongs to a server.
 * @func
 * @returns {boolean}
 */
export const isServerSide: () => boolean = () =>
  typeof process !== 'undefined' && process.release && process.release.name === 'node';

/**
 * Check if current execution belongs to a browser.
 * @func
 * @returns {boolean}
 */
export const isClientSide: () => boolean = complement(isServerSide);

/**
 * Retrieve the querystring value from the location object if we are in the client or
 * from the request query if we are in the server.
 * @func
 * @param {Location} location a request location object
 * @param {Request} req a request object
 * @returns {object}
 */
export const getQueryString = (
  { search }: { search: string } = {},
  { query }: { query: QueryType } = {}
) => (isClientSide() ? parse(search) : query);

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
 * @function
 * @param {string} pathname a request pathname
 * @param {Array<Route>} routes a list of routes
 * @returns {Route} the route matched with the pathname or undefined
 */
export const findRouteByPathname = curry((pathname: string, routes: Array<Route>) =>
  find(checkMatchPath(pathname), routes)
);

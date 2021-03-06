// @flow strict
import { parse } from 'query-string';
import { matchPath } from 'react-router-dom';
import { anyPass, equals, complement, find, is, isNil } from 'ramda';
import type { QueryType } from 'Before.component';
import type { Route } from 'ensureReady';

/**
 * Check if given argument has a null value.
 * @func
 * @param {any} value to compare
 * @returns {boolean}
 */
const isNull = equals(null);
/**
 * Check if given argument has a not null value.
 * @func
 * @param {any} value to compare
 * @returns {boolean}
 */
const isNotNull = complement(isNull);

let GeneratorFunction = null;
try {
  GeneratorFunction = new Function('return function* () {}')().constructor; // eslint-disable-line no-new-func
} catch (e) {}

/**
 * Check if given function is a generator function.
 * @param {function} fn to compare
 * @returns {boolean}
 */
const isGeneratorFunction = fn => {
  const toStringCheck = Object.prototype.toString.call(fn) === '[object GeneratorFunction]';
  const legacyConstructorCheck = isNotNull(GeneratorFunction) && fn instanceof GeneratorFunction;

  return toStringCheck || legacyConstructorCheck;
};

/**
 * Check if given function is an async function.
 * @param {function} fn to compare
 * @returns {boolean}
 */
const isAsyncFunction = fn => Object.prototype.toString.call(fn) === '[object AsyncFunction]';

/**
 * Check if given function is actually any type of function.
 * @func
 * @param {function} fn
 * @returns {boolean}
 */
// $FlowFixMe
export const isFunction: fn => boolean = anyPass([
  is(Function),
  isGeneratorFunction,
  isAsyncFunction
]);

/**
 * Check if given value is a promise.
 * @func
 * @param {any} value to compare
 * @returns {boolean}
 */
// $FlowFixMe
export const isPromise: (value: any) => boolean = is(Promise);

/**
 * Check if given value is an intance of Error.
 * @func
 * @param {any} value to compare
 * @returns {boolean}
 */
// $FlowFixMe
export const isError: (value: any) => boolean = is(Error);

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
export const isNotNil = complement(isNil);

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
export const findRouteByPathname = (pathname: string) => find(checkMatchPath(pathname));

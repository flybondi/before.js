// @flow strict
import { anyPass, equals, is, complement } from 'ramda';

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
// $FlowFixMe
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
// $FlowFixMe
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

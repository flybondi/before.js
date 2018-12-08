// @flow strict
import { anyPass, equals, is, complement } from 'ramda';

const isNull = equals(null);
const isNotNull = complement(isNull);
let GeneratorFunction = null;
try {
  GeneratorFunction = new Function('return function* () {}')().constructor; // eslint-disable-line no-new-func
} catch (e) {}

const isGeneratorFunction = (value: any) => {
  const toStringCheck = Object.prototype.toString.call(value) === '[object GeneratorFunction]';
  const legacyConstructorCheck = isNotNull(GeneratorFunction) && value instanceof GeneratorFunction;

  return toStringCheck || legacyConstructorCheck;
};

const isAsyncFunction = (value: any) =>
  Object.prototype.toString.call(value) === '[object AsyncFunction]';

export const isFunction: (value: any) => boolean = anyPass([
  is(Function),
  isGeneratorFunction,
  isAsyncFunction
]);

export const isPromise: (value: any) => boolean = is(Promise);

export const isError: (value: any) => boolean = is(Error);

export const isServerSide: () => boolean = () =>
  typeof process !== 'undefined' && process.release && process.release.name === 'node';

export const isClientSide: () => boolean = complement(isServerSide);

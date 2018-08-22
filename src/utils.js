// @flow strict;
import { anyPass, is, complement } from 'ramda';
import { isGeneratorFunction, isAsyncFunction } from 'ramda-adjunct';

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

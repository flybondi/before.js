'use strict';

const { T, F } = require('ramda');

test('should return true if is a function', () => {
  const { isFunction } = require('./utils');
  expect(isFunction(() => '')).toBeTruthy();
});

test('should return false if not a function', () => {
  const { isFunction } = require('./utils');
  expect(isFunction('')).toBeFalsy();
});

test('should return true if is a Promise', () => {
  const { isPromise } = require('./utils');
  expect(isPromise(new Promise((T, F)))).toBeTruthy();
});

test('should return false if not a Promise', () => {
  const { isPromise } = require('./utils');
  expect(isPromise('')).toBeFalsy();
});

test('should return true if we are in the server', () => {
  const { isServerSide } = require('./utils');

  expect(isServerSide()).toBeTruthy();
});

test('should return true if we are in the browser', () => {
  const p = global.process;
  global.process = undefined;
  const { isClientSide } = require('./utils');

  expect(isClientSide()).toBeTruthy();
  global.process = p;
});

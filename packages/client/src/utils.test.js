'use strict';

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

test('should retrieve the querystring from the location', () => {
  const p = global.process;
  global.process = undefined;
  const { isClientSide, getQueryString } = require('./utils');
  const query = getQueryString({ search: '?isTest=true' });

  expect(isClientSide()).toBeTruthy();
  expect(query).toHaveProperty('isTest', 'true');
  global.process = p;
});

test('should retrieve the querystring from the request object', () => {
  const { isClientSide, getQueryString } = require('./utils');
  const query = getQueryString(undefined, { query: { isTest: 'true' } });

  expect(isClientSide()).toBeFalsy();
  expect(query).toHaveProperty('isTest', 'true');
});

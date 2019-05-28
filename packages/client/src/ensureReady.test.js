'use strict';
const React = require('react');
const { asyncComponent } = require('./Async.component');

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  global.document && delete global.document;
});

test('should load all routes and retrieve data from context', async () => {
  jest.doMock('./utils', () => {
    const utils = jest.requireActual('./utils');
    return {
      ...utils,
      isClientSide: jest.fn().mockReturnValue(true)
    };
  });

  const DummyComponent = () => <span>Hi there!</span>;
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/test',
      exact: true,
      component: asyncComponent({ loader: mockLoader })
    }
  ];
  const mockState = {
    textContent: JSON.stringify({ test: true })
  };
  global.document = {
    getElementById: jest.fn().mockReturnValue(mockState)
  };
  const { loadCurrentRoute } = require('./ensureReady');

  const response = await loadCurrentRoute(mockRoutes, '/');
  expect(document.getElementById).toHaveBeenCalledWith('server-app-state');
  expect(response).toHaveProperty('test', true);
});

test('should not retrieve the server-app-state if running on server', async () => {
  jest.doMock('./utils', () => {
    const utils = jest.requireActual('./utils');
    return {
      ...utils,
      isClientSide: jest.fn().mockReturnValue(false)
    };
  });
  const DummyComponent = () => <span>Hi there!</span>;
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/test',
      exact: true,
      component: asyncComponent({ loader: mockLoader })
    }
  ];
  const { loadCurrentRoute } = require('./ensureReady');

  const response = await loadCurrentRoute(mockRoutes, '/');
  expect(response).toBeUndefined();
});

test('should get the server-app-state but without loading the route components', async () => {
  jest.doMock('./utils', () => {
    const utils = jest.requireActual('./utils');
    return {
      ...utils,
      isClientSide: jest.fn().mockReturnValue(true)
    };
  });
  const DummyComponent = () => <span>Hi there!</span>;
  const mockRoutes = [
    {
      path: '/test',
      exact: true,
      component: DummyComponent
    },
    {
      path: '/no-load',
      exact: true,
      component: DummyComponent
    }
  ];
  const mockState = {
    textContent: JSON.stringify({ test: true })
  };
  global.document = {
    getElementById: jest.fn().mockReturnValue(mockState)
  };
  const { loadCurrentRoute } = require('./ensureReady');

  const response = await loadCurrentRoute(mockRoutes, '/');
  expect(document.getElementById).toHaveBeenCalledWith('server-app-state');
  expect(response).toHaveProperty('test', true);
});

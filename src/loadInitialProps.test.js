'use strict';

const React = require('react');
const { asyncComponent } = require('./Async.component');
const { fetchInitialPropsFromRoute } = require('./loadInitialProps');

test('should return null if the pathname is invalid', async () => {
  const DummyComponent = () => <span>Hi there!</span>;
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/',
      exact: true,
      component: asyncComponent({ loader: mockLoader })
    }
  ];

  const props = await fetchInitialPropsFromRoute(mockRoutes, '/test-pathname');
  expect(mockLoader).not.toHaveBeenCalled();
  expect(props).toHaveProperty('route', null);
  expect(props).toHaveProperty('data', null);
});

test('should return a Match value but without data', async () => {
  const DummyComponent = () => <span>Hi there!</span>;
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/',
      exact: true,
      component: asyncComponent({ loader: mockLoader })
    },
    {
      path: '/no-match-path'
    }
  ];

  const props = await fetchInitialPropsFromRoute(mockRoutes, '/');
  expect(mockLoader).toHaveBeenCalled();
  expect(props).toHaveProperty('route', {
    isExact: true,
    params: {},
    path: '/',
    url: '/',
    ...mockRoutes[0]
  });
  expect(props).toHaveProperty('data', null);
});

test('should load an async component and fetch their initial props', async () => {
  const DummyComponent = () => <span>Hi there!</span>;
  DummyComponent.getInitialProps = jest.fn().mockResolvedValue({ test: true });
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/',
      exact: true,
      component: asyncComponent({ loader: mockLoader })
    },
    {
      path: '/no-match-path'
    }
  ];
  const mockMatch = {
    isExact: true,
    params: {},
    path: '/',
    url: '/'
  };
  const mockContext = {
    req: {},
    res: {}
  };

  const props = await fetchInitialPropsFromRoute(mockRoutes, '/', mockContext);
  expect(mockLoader).toHaveBeenCalled();
  expect(DummyComponent.getInitialProps).toHaveBeenCalledWith({
    match: mockMatch,
    ...mockContext
  });
  expect(props).toHaveProperty('route', { ...mockMatch, ...mockRoutes[0] });
  expect(props).toHaveProperty('data', {
    test: true
  });
});

test('should fetch initial props from matched route component', async () => {
  const DummyComponent = () => <span>Hi there!</span>;
  DummyComponent.getInitialProps = jest.fn().mockResolvedValue({ test: true });
  const mockRoutes = [
    {
      path: '/',
      exact: true,
      component: DummyComponent
    },
    {
      path: '/no-match-path'
    }
  ];
  const mockMatch = {
    isExact: true,
    params: {},
    path: '/',
    url: '/'
  };

  const props = await fetchInitialPropsFromRoute(mockRoutes, '/');

  expect(DummyComponent.getInitialProps).toHaveBeenCalledWith({
    match: mockMatch
  });
  expect(props).toHaveProperty('route', { ...mockMatch, ...mockRoutes[0] });
  expect(props).toHaveProperty('data', {
    test: true
  });
});

test('should not fetch initial props from matched route component', async () => {
  const DummyComponent = () => <span>Hi there!</span>;
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/',
      exact: true,
      component: asyncComponent({ loader: mockLoader })
    },
    {
      path: '/no-match-path'
    }
  ];
  const mockMatch = {
    isExact: true,
    params: {},
    path: '/',
    url: '/'
  };
  const mockContext = {
    req: {},
    res: {}
  };

  const props = await fetchInitialPropsFromRoute(mockRoutes, '/', mockContext);
  expect(mockLoader).toHaveBeenCalled();
  expect(props).toHaveProperty('route', { ...mockMatch, ...mockRoutes[0] });
  expect(props).toHaveProperty('data', null);
});

test('should throw an error while fetching initial props from matched route component', async () => {
  const DummyComponent = () => <span>Hi there!</span>;
  DummyComponent.getInitialProps = jest.fn().mockRejectedValue(new Error('mock error'));
  const mockRoutes = [
    {
      path: '/',
      exact: true,
      component: DummyComponent
    },
    {
      path: '/no-match-path'
    }
  ];
  const mockMatch = {
    isExact: true,
    params: {},
    path: '/',
    url: '/'
  };

  try {
    await fetchInitialPropsFromRoute(mockRoutes, '/');
  } catch (error) {
    expect(DummyComponent.getInitialProps).toHaveBeenCalledWith({
      match: mockMatch
    });
    expect(error).toHaveProperty('message', 'mock error');
  }
});

test('should throw an error while fetching initial props from matched async route component', async () => {
  const DummyComponent = () => <span>Hi there!</span>;
  DummyComponent.getInitialProps = jest.fn().mockRejectedValue(new Error('mock async error'));
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/',
      exact: true,
      component: asyncComponent({ loader: mockLoader })
    },
    {
      path: '/no-match-path'
    }
  ];
  const mockMatch = {
    isExact: true,
    params: {},
    path: '/',
    url: '/'
  };

  try {
    await fetchInitialPropsFromRoute(mockRoutes, '/');
  } catch (error) {
    expect(mockLoader).toHaveBeenCalled();
    expect(DummyComponent.getInitialProps).toHaveBeenCalledWith({
      match: mockMatch
    });
    expect(error).toHaveProperty('message', 'mock async error');
  }
});

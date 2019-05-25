'use strict';
/* eslint react/prop-types: 0 */

const React = require('react');
const { asyncComponent } = require('./Async.component');
const DummyComponent = () => <span>Hi there!</span>;

beforeEach(() => {
  global.window = undefined;
  global.document = undefined;
  process.browser = undefined;
});

afterEach(() => {
  delete global.window;
  delete global.document;
  delete process.browser;
});

test('should use the default document', async () => {
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/',
      exact: true,
      component: asyncComponent({ loader: mockLoader, LoadableComponent: DummyComponent })
    }
  ];
  const options = {
    req: {
      path: '/',
      originalUrl: 'https://test.com',
      query: {}
    },
    res: {
      redirect: jest.fn(),
      status: jest.fn()
    },
    routes: mockRoutes,
    assets: { client: {} }
  };
  const { render } = require('./render');
  const html = await render(options);
  expect(html).toBeDefined();
  expect(html).toContain('<!doctype html>');
  expect(html).not.toContain('BEFORE.JS-DATA');
});

test('should return a 404', async () => {
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '**',
      exact: true,
      component: asyncComponent({ loader: mockLoader, LoadableComponent: DummyComponent })
    }
  ];
  const options = {
    req: {
      path: '/',
      originalUrl: 'https://test.com'
    },
    res: {
      redirect: jest.fn(),
      status: jest.fn()
    },
    routes: mockRoutes,
    assets: { client: {} }
  };
  const { render } = require('./render');
  await render(options);
  expect(options.res.status).toHaveBeenCalledWith(404);
});

test('should redirect to given path', async () => {
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const mockRoutes = [
    {
      path: '/home',
      exact: true,
      component: asyncComponent({ loader: mockLoader, LoadableComponent: DummyComponent }),
      redirectTo: '/path-to-redirect'
    }
  ];
  const options = {
    req: {
      path: '/home',
      originalUrl: 'https://test.com/home'
    },
    res: {
      redirect: jest.fn(),
      status: jest.fn()
    },
    routes: mockRoutes,
    assets: { client: {} }
  };
  const { render } = require('./render');
  await render(options);
  expect(options.res.redirect).toHaveBeenCalledWith(301, 'https://test.com/path-to-redirect');
});

test('should throw an error if can not load route component initial props', async () => {
  const InitialPropsComponent = () => <span />;
  InitialPropsComponent.getInitialProps = jest.fn().mockRejectedValue(new Error('mock error'));
  const ErrorComponent = ({ error }) => <span>{error.message}</span>;
  const mockLoader = jest.fn().mockResolvedValue(InitialPropsComponent);
  const mockRoutes = [
    {
      path: '/home',
      exact: true,
      component: asyncComponent({ loader: mockLoader, LoadableComponent: InitialPropsComponent }),
      redirectTo: '/path-to-redirect'
    }
  ];
  const options = {
    req: {
      path: '/home',
      originalUrl: 'https://test.com/home'
    },
    res: {
      redirect: jest.fn(),
      status: jest.fn()
    },
    routes: mockRoutes,
    assets: { client: {} },
    errorComponent: ErrorComponent
  };
  const { render } = require('./render');
  const html = await render(options);
  expect(InitialPropsComponent.getInitialProps).toHaveBeenCalled();
  expect(html).toContain('<span>mock error</span>');
});

test('should use given Document component', async () => {
  const mockLoader = jest.fn().mockResolvedValue(DummyComponent);
  const CustomDocument = ({ text }) => <p>{text}</p>;
  CustomDocument.getInitialProps = jest
    .fn()
    .mockResolvedValue({ text: 'This is a custom document' });
  const mockRoutes = [
    {
      path: '/test',
      exact: true,
      component: asyncComponent({ loader: mockLoader, LoadableComponent: DummyComponent })
    }
  ];
  const options = {
    req: {
      path: '/test',
      originalUrl: 'https://test.com/test'
    },
    res: {
      redirect: jest.fn(),
      status: jest.fn()
    },
    routes: mockRoutes,
    assets: { client: {} },
    document: CustomDocument
  };
  const { render } = require('./render');
  const html = await render(options);
  expect(CustomDocument.getInitialProps).toHaveBeenCalled();
  expect(html).toEqual('<!doctype html><p>This is a custom document</p>');
});

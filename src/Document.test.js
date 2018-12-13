/**
 * @jest-environment jsdom
 */

import React from 'react';
import { mount } from 'enzyme';
import { DocumentComponent as Document } from './Document.component';

test('should render the server-app-state', () => {
  const documentProps = {
    helmet: {
      title: {
        toComponent: jest.fn()
      },
      meta: {
        toComponent: jest.fn()
      },
      link: {
        toComponent: jest.fn()
      },
      script: {
        toComponent: jest.fn()
      },
      htmlAttributes: {
        toComponent: jest.fn()
      },
      bodyAttributes: {
        toComponent: jest.fn()
      }
    },
    assets: {
      client: {
        css: 'css-path.css',
        js: 'js-path.js'
      }
    },
    data: {
      test: true
    },
    title: 'This is a test',
    filterServerData: data => data
  };
  const wrapper = mount(<Document {...documentProps} />);
  const title = wrapper.find('title');
  const script = wrapper.find('#server-app-state');
  const link = wrapper.find('link');
  const root = wrapper.find('#root');

  expect(documentProps.helmet.title.toComponent).toHaveBeenCalled();
  expect(documentProps.helmet.meta.toComponent).toHaveBeenCalled();
  expect(documentProps.helmet.link.toComponent).toHaveBeenCalled();
  expect(title.text()).toBe('This is a test');
  expect(script.text()).toBe('{"test":true}');
  expect(root.text()).toBe('BEFORE.JS-DATA');
  expect(link.prop('href')).toBe('css-path.css');
});

test('should filter the server-app-state with the given function', () => {
  const documentProps = {
    helmet: {
      title: {
        toComponent: jest.fn()
      },
      meta: {
        toComponent: jest.fn()
      },
      link: {
        toComponent: jest.fn()
      },
      script: {
        toComponent: jest.fn()
      },
      htmlAttributes: {
        toComponent: jest.fn()
      },
      bodyAttributes: {
        toComponent: jest.fn()
      }
    },
    assets: {
      client: {
        css: 'css-path.css',
        js: 'js-path.js'
      }
    },
    data: {
      test: true,
      shouldFilterMe: true
    },
    title: 'This is a test',
    filterServerData: jest.fn().mockImplementation(({ shouldFilterMe, ...rest }) => rest)
  };
  const wrapper = mount(<Document {...documentProps} />);
  const title = wrapper.find('title');
  const script = wrapper.find('#server-app-state');
  const link = wrapper.find('link');
  const root = wrapper.find('#root');

  expect(documentProps.helmet.title.toComponent).toHaveBeenCalled();
  expect(documentProps.helmet.meta.toComponent).toHaveBeenCalled();
  expect(documentProps.helmet.link.toComponent).toHaveBeenCalled();
  expect(title.text()).toBe('This is a test');
  expect(script.text()).toBe('{"test":true}');
  expect(root.text()).toBe('BEFORE.JS-DATA');
  expect(link.prop('href')).toBe('css-path.css');
});

test('should call the function to generate the critical CSS', () => {
  const documentInitialProps = {
    assets: {
      client: {
        css: 'css-path.css',
        js: 'js-path.js'
      }
    },
    data: {
      test: true,
      shouldFilterMe: true
    },
    title: 'This is a test',
    renderPage: jest.fn().mockResolvedValue({ html: 'test' }),
    generateCriticalCSS: jest.fn().mockReturnValue('critical styles')
  };
  return expect(Document.getInitialProps(documentInitialProps)).resolves.toMatchObject(
    expect.objectContaining({
      criticalCSS: 'critical styles'
    })
  );
});

/**
 * @jest-environment jsdom
 */

import React from 'react';
import BeforeComponent from './Before.component';
import ReactDOM from 'react-dom';
import { MemoryRouter, Switch, Redirect } from 'react-router-dom';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

// NOTE(lf): work around until React.memo is fully supported by Jest (https://github.com/airbnb/enzyme/issues/1875)
jest.mock('react', () => {
  const r = jest.requireActual('react');
  return { ...r, memo: x => x };
});

jest.mock('./utils', () => {
  const { T } = jest.requireActual('ramda');
  return {
    isClientSide: T
  };
});

afterAll(() => {
  jest.resetModules();
});

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

xtest('the rendered component should have a Route component', () => {
  const DummyComponent = () => <span>Hi there!</span>;
  const beforeProps = {
    routes: [
      {
        path: '/',
        exact: true,
        component: DummyComponent
      }
    ]
  };
  const wrapper = mount(
    <MemoryRouter initialEntries={['/']} initialIndex={0}>
      <BeforeComponent {...beforeProps} />
    </MemoryRouter>
  );
  const routes = wrapper.find(Switch).childAt(0);
  const route = routes.childAt(0);

  expect(wrapper.find(Switch).props().location).toHaveProperty('pathname', '/');
  expect(wrapper.find(Switch).children()).toHaveLength(1);
  expect(route.key()).toEqual('route--0');
  expect(route.props().path).toEqual('/');
  expect(route.props().exact).toBeTruthy();
});

xtest('fetch initial props from current route component', () => {
  const getInitialProps = jest.fn().mockReturnValue({ name: 'DummyComponent' });
  const DummyComponent = () => <span>Hi there!</span>;
  DummyComponent.getInitialProps = getInitialProps;

  const beforeProps = {
    routes: [
      {
        path: '/',
        component: () => <Redirect from="/" to="/props" />
      },
      {
        path: '/props',
        component: DummyComponent
      }
    ],
    data: {}
  };
  act(() => {
    ReactDOM.render(
      <MemoryRouter initialEntries={['/']} initialIndex={0}>
        <BeforeComponent {...beforeProps} />
      </MemoryRouter>,
      container
    );
  });
  expect(getInitialProps).toHaveBeenCalled();
});

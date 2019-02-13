/**
 * @jest-environment jsdom
 */

import React from 'react';
import BeforeComponent, { Before } from './Before.component';
import { StaticRouter, Switch } from 'react-router-dom';
import { mount, shallow } from 'enzyme';

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

xtest('the rendered component should have a Route component', () => {
  const DummyComponent = () => <span>Hi there!</span>;
  const context = {};
  const beforeProps = {
    location: {
      pathname: '/'
    },
    routes: [
      {
        path: '/',
        exact: true,
        component: DummyComponent
      }
    ]
  };
  const wrapper = mount(
    <StaticRouter location="/" context={context}>
      <BeforeComponent {...beforeProps} />
    </StaticRouter>
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
    location: {
      pathname: '/'
    },
    routes: [
      {
        path: '/',
        component: () => <span>Hi there!</span>
      },
      {
        path: '/props',
        component: DummyComponent
      }
    ],
    data: {}
  };
  const wrapper = shallow(<Before {...beforeProps} />);
  wrapper.setProps({ location: { pathname: '/props' } });
  expect(getInitialProps).toHaveBeenCalled();
});

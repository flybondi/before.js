/**
 * @jest-environment jsdom
 */

import React from 'react';
import Before from './Before.component';
import { StaticRouter, Switch } from 'react-router-dom';
import { mount } from 'enzyme';

// NOTE(lf): work around until React.memo is fully supported by Jest (https://github.com/airbnb/enzyme/issues/1875)
jest.mock('react', () => {
  const r = jest.requireActual('react');
  return { ...r, memo: x => x };
});

test('the rendered component should have a Route component', () => {
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
      <Before {...beforeProps} />
    </StaticRouter>
  );
  const route = wrapper.find(Switch).childAt(0);
  expect(wrapper.find(Switch).props().location).toHaveProperty('pathname', '/');
  expect(wrapper.find(Switch).children()).toHaveLength(1);
  console.log(route, wrapper, 123);
  expect(route.key()).toEqual('route--0');
  expect(route.props().path).toEqual('/');
  expect(route.props().exact).toBeTruthy();
});

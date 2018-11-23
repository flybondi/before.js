/**
 * @jest-environment jsdom
 */

import React from 'react';
import Error from './Error.component';
import { shallow } from 'enzyme';

test('the rendered component should have an scary face emoticon', () => {
  const wrapper = shallow(<Error />);
  const span = wrapper.find('span');
  expect(span.text()).toEqual('😱');
});

test('should render with default classes', () => {
  const wrapper = shallow(<Error />);

  expect(wrapper.hasClass('w-75')).toBeTruthy();
  expect(wrapper.hasClass('center')).toBeTruthy();
  expect(wrapper.hasClass('mt6')).toBeTruthy();
});

test('should render with given message, stack and className', () => {
  const wrapper = shallow(
    <Error className="customClass" message="test message" stack="test stack" />
  );
  const section = wrapper.find('section');
  expect(wrapper.hasClass('customClass')).toBeTruthy();
  expect(section.find('strong').text()).toEqual('test message');
  expect(
    section
      .find('p')
      .last()
      .text()
  ).toEqual('test stack');
});

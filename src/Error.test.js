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

test('should render with given message and stack', () => {
  const wrapper = shallow(
    <Error className="customClass" message="test message" stack="test stack" />
  );
  const section = wrapper.find('section');
  expect(section.find('strong').text()).toEqual('test message');
  expect(
    section
      .find('p')
      .last()
      .text()
  ).toEqual('test stack');
});

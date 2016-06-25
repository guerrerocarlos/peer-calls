jest.unmock('../joinCall.js');

const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const JoinCall = require('../joinCall.js');
const callActions = require('../../action/callActions.js');
const callIdStore = require('../../store/callIdStore.js');

describe('joinCall', () => {

  let component, node;
  function render(c) {
    component = TestUtils.renderIntoDocument(c);
    node = ReactDOM.findDOMNode(component);
  }

  beforeEach(() => {
    callActions.join.mockClear();
    callIdStore.isPasswordRequired.mockClear();
  });

  describe('render', () => {

    it('should have password set to blank', () => {
      render(<JoinCall />);
      let node = ReactDOM.findDOMNode(component);
      let pwd = node.querySelector('input[type=password]');
      expect(pwd.value).toEqual('');
    });

    it('should set password on change', () => {
      render(<JoinCall />);

      let pwd = node.querySelector('input[type=password]');
      pwd.value = 'test123';
      TestUtils.Simulate.change(pwd);

      // console.log('aaaa', component);
      expect(component.state.password).toEqual('test123');
    });

    it('sets text to enter password if password required', () => {
      callIdStore.isPasswordRequired.mockReturnValue(true);
      render(<JoinCall passwordRequired />);
      expect(node.textContent).toMatch(/Enter password/);
    });
  });

  describe('form', () => {

    it('calls callActions.join when onSubmit', () => {
      render(<JoinCall />);
      component.state.password = 'abc123';

      TestUtils.Simulate.submit(node);

      expect(callActions.join.mock.calls.length).toBe(1);
      expect(callActions.join.mock.calls[0][0]).toBe('abc123');
    });

  });

});

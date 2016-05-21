jest.unmock('../joinCall.js');

const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const JoinCall = require('../joinCall.js');

describe('joinCall', () => {

  function render() {
    return TestUtils.renderIntoDocument(<JoinCall />);
    // return ReactDOM.findDOMNode(component);
  }

  describe('render', () => {

    it('should have password set to blank', () => {
      let component = render();
      let node = ReactDOM.findDOMNode(component);
      let pwd = node.querySelector('input[type=password]');
      expect(pwd.value).toEqual('');
    });

    it('should set password on change', () => {
      let component = render();
      let node = ReactDOM.findDOMNode(component);

      let pwd = node.querySelector('input[type=password]');
      pwd.value = 'test123';
      TestUtils.Simulate.change(pwd);

      // console.log('aaaa', component);
      expect(component.state.password).toEqual('test123');
    });

  });

});

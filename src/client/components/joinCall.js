const React = require('react');
const callActions = require('../action/callActions.js');
const callIdStore = require('../store/callIdStore.js');

let joinCall = React.createClass({
  getInitialState() {
    return { password: '' };
  },
  handleJoin(event) {
    event.preventDefault();
    callActions.join(this.state.password);
  },
  handleTypePassword(event) {
    this.setState({
      password: event.target.value
    });
  },
  render() {
    let message = 'Set Password (optional):';
    if (callIdStore.isPasswordRequired()) message = 'Enter password:';

    return (
      <form className="join-call" onSubmit={this.handleJoin}>
        {message}
        <input
          onChange={this.handleTypePassword}
          type="password"
          value={this.state.password}
        />
        <button type="submit">{'Join'}</button>
      </form>
    );
  }
});

module.exports = joinCall;

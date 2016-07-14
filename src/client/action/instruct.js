const dispatcher = require('../dispatcher/dispatcher.js');

function format(string, args) {
  string = args
  .reduce((string, arg, i) => string.replace('{' + i + '}', arg), string);
  return string;
}

function _instruct(type, args) {
  let string = args[0] || '';
  let message = format(string, Array.prototype.slice.call(args, 1));
  dispatcher.dispatch({
    type: 'instruct',
    notification: { type, message }
  });
}

function info() {
  _instruct('info', arguments);
}

function warn() {
  _instruct('warning', arguments);
}

function error() {
  _instruct('error', arguments);
}

function alert(message, dismissable) {
  dispatcher.dispatch({
    type: 'alert',
    alert: {
      action: dismissable ? 'Dismiss' : '',
      dismissable: !!dismissable,
      message,
      type: 'warning'
    }
  });
}

module.exports = { alert, info, warn, error };

const EventEmitter = require('events');
const dispatcher = require('../dispatcher/dispatcher.js');
const handshake = require('../peer/handshake.js');

const emitter = new EventEmitter();
const addListener = cb => emitter.on('change', cb);
const removeListener = cb => emitter.removeListener('change', cb);

let _socket;
let _stream;
let _showJoinMenu = true;

const handlers = {
  connected: ({ socket, stream }) => {
    _socket = socket;
    _stream = stream;
    _showJoinMenu = true;
  },
  authenticate: () => {
    _showJoinMenu = false;
  },
  'authentication-failed': () => {
    _showJoinMenu = true;
  },
  'authenticated': () => {
    handshake.init(_socket, _stream);
  }
};

const getSocket = () => _socket;
const getStream = () => _stream;
const shouldShowJoinMenu = () => _showJoinMenu;

const dispatcherIndex = dispatcher.register(action => {
  let handle = handlers[action.type];
  if (!handle) return;
  handle(action);
  emitter.emit('change');
});

module.exports = {
  addListener,
  dispatcherIndex,
  getSocket,
  getStream,
  removeListener,
  shouldShowJoinMenu
};

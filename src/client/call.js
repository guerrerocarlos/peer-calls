const Promise = require('bluebird');
const debug = require('debug')('peer-calls:call');
const dispatcher = require('./dispatcher/dispatcher.js');
const getUserMedia = require('./browser/getUserMedia.js');
const play = require('./browser/video.js').play;
const notify = require('./action/notify.js');
const socket = require('./socket.js');

dispatcher.register(action => {
  if (action.type === 'play') play();
});

function init() {
  Promise.all([connect(), getCameraStream()])
  .spread((_socket, stream) => {
    dispatcher.dispatch({
      socket: _socket,
      stream: stream,
      type: 'connected'
    });
  });
}

function connect() {
  return new Promise(resolve => {
    socket.once('connect', () => {
      notify.warn('Connected to server socket');
      debug('socket connected');
      resolve(socket);
    });
    socket.on('authentication-failed', () => {
      dispatcher.dispatch({ type: 'authentication-failed' });
      notify.error('Authentication failed');
    });
    socket.once('authenticated', () => {
      dispatcher.dispatch({ type: 'authenticated' });
      notify.info('Authenticated');
    });
    socket.on('disconnect', () => {
      notify.error('Server socket disconnected');
    });
  });
}

function getCameraStream() {
  return getUserMedia({
    video: {
      facingMode: 'user'
    },
    audio: true
  })
  .then(stream => {
    debug('got our media stream:', stream);
    dispatcher.dispatch({
      type: 'add-stream',
      userId: '_me_',
      stream
    });
    return stream;
  })
  .catch(() => {
    notify.alert('Could not get access to microphone & camera');
  });
}

module.exports = { init };

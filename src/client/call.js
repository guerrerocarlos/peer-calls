const Promise = require('bluebird');
const debug = require('debug')('peer-calls:call');
const dispatcher = require('./dispatcher/dispatcher.js');
const getUserMedia = require('./browser/getUserMedia.js');
const play = require('./browser/video.js').play;
const notify = require('./action/notify.js');
const instruct = require('./action/instruct.js');
const handshake = require('./peer/handshake.js');
const socket = require('./socket.js');

dispatcher.register(action => {
  if (action.type === 'play') play();
});

function init() {
  const callId = window.document.getElementById('callId').value;

  Promise.all([connect(), getCameraStream()])
  .spread((_socket, stream) => {
    debug('initializing peer connection');
    handshake.init(_socket, callId, stream);
  });
}

function connect() {
  return new Promise(resolve => {
    socket.once('connect', () => {
      const callId = window.document.getElementById('callId').value;
      
      instruct.info('Peerscall started');
      instruct.warn('Please give this site\'s URL to your peers so they can join the call ☝');
      debug('socket connected');
      resolve(socket);
    });
    socket.on('disconnect', () => {
      notify.error('Server socket disconnected');
    });
  });
}

function getCameraStream() {
  return getUserMedia({ video: true, audio: true })
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

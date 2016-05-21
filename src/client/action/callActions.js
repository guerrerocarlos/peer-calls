'use strict';
const socket = require('../socket.js');
const callIdStore = require('../store/callIdStore.js');

function join(password) {
  let callId = callIdStore.getCallId();
  socket.emit('authenticate', { callId, password });
}

module.exports = { join };

'use strict';
const _ = require('underscore');
const debug = require('debug')('peer-calls:socket');
const password = require('./password.js');

module.exports = function(socket, io) {

  function authenticate(credentials) {
    let callId = credentials && credentials.callId;

    password.isRequired(callId)
    .then(required => {
      if (required) {
        return password.verify(credentials);
      }
      if (credentials.password) {
        return password.set(credentials)
        .then(() => io.to(callId).emit('password', 'Password set'));
      };
    })
    .then(() => {
      debug('authenticated: %s, room: %s', socket.id, callId);
      // You can only authenticate once, remove this listener after successfully
      // authenticated
      socket.removeListener('authenticate', authenticate);

      socket.on('signal', payload => {
        // debug('signal: %s, payload: %o', socket.id, payload);
        io.to(payload.userId).emit('signal', {
          userId: socket.id,
          signal: payload.signal
        });
      });

      socket.join(callId);
      socket.room = callId;
      socket.authenticated = true;

      socket.authenticated = true;
      socket.emit('authenticated');
    })
    .catch(err => {
      debug('authentication failed: %s because: %s', socket.id, err.message);
      socket.emit('authentication-failed');
    });

  }

  socket.on('authenticate', authenticate);
  socket.on('join', () => {
    if (!socket.authenticated) {
      debug('join denied socket: %s, room: %s', socket.id, socket.room);
      return socket.emit('permission-denied', 'join');
    }
    let users = getUsers(socket.room);
    debug('join success socket: %s, room: %s', socket.id, socket.room);
    return io.to(socket.room).emit('users', {
      initiator: socket.id,
      users
    });
  });

  function getUsers(callId) {
    return _.map(io.sockets.adapter.rooms[callId].sockets, (_, id) => {
      return { id };
    });
  }

};

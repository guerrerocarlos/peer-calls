'use strict';
jest.unmock('../socket.js');
jest.unmock('events');
jest.unmock('underscore');

const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;
const handleSocket = require('../socket.js');
const password = require('../password.js');

password.verify.mockImplementation(credentials => {
  let callId = credentials.callId;
  if (callId === 'call1' && credentials.password === 'password') {
    return Promise.resolve();
  }
  if (callId === 'call2' && credentials.password === 'password') {
    return Promise.resolve();
  }
  if (callId === 'call3' && credentials.password === 'password') {
    return Promise.resolve();
  }
  if (callId === 'call1' || callId === 'call2' || callId === 'call3') {
    return Promise.reject(new Error('Invalid credentials'));
  }
  return Promise.resolve();
});

const passwordRequired = {
  'call1': true,
  'call2': true,
  'call3': true
};
password.isRequired.mockImplementation(callId => {
  return Promise.resolve(passwordRequired[callId]);
});

password.set.mockImplementation(() => Promise.resolve());

describe('socket', () => {

  let socket, io, rooms;
  beforeEach(() => {
    socket = new EventEmitter();
    socket.id = '/#socket0';
    socket.join = jest.genMockFunction();
    socket.leave = jest.genMockFunction();
    password.set.mockClear();
    // let emit = socket.emit;
    // socket.emit = jest.genMockFunction().mockImplementation(function() {
    //   return emit.apply(socket, arguments);
    // });
    rooms = {};

    io = {};
    io.in = io.to = jest.genMockFunction().mockImplementation(room => {
      return (rooms[room] = rooms[room] || {
        emit: jest.genMockFunction()
      });
    });

    io.sockets = {
      adapter: {
        rooms: {
          call1: {
            sockets: {
              '/#socket0': true
            }
          },
          call2: {
            sockets: {
              '/#socket0': true
            }
          },
          call3: {
            sockets: {
              '/#socket0': true,
              '/#socket1': true,
              '/#socket2': true
            }
          },
          call4: {
            sockets: {
              '/#socket0': true
            }
          }
        }
      }
    };

    socket.leave = jest.genMockFunction();
    socket.join = jest.genMockFunction();
  });

  it('should be a function', () => {
    expect(typeof handleSocket).toBe('function');
  });

  describe('authenticate', () => {

    beforeEach(() => handleSocket(socket, io));

    it('emits authentication-failed whwen invalid password', done => {
      socket.on('authentication-failed', () => {
        expect(socket.join.mock.calls.length).toBe(0);
        done();
      });

      socket.emit('authenticate', {
        callId: 'call1',
        password: 'invalid'
      });
    });

    it('emits authenticated when valid password', done => {
      socket.on('authenticated', () => {
        expect(socket.join.mock.calls).toEqual([[ 'call1' ]]);
        done();
      });

      socket.emit('authenticate', {
        callId: 'call1',
        password: 'password'
      });
    });

    it('sets password if not blank and no previous password', done => {
      socket.on('authenticated', () => {
        expect(password.set.mock.calls).toEqual([[{
          callId: 'call4',
          password: 'password123'
        }]]);
        done();
      });

      socket.emit('authenticate', {
        callId: 'call4',
        password: 'password123'
      });
    });

    it('authenticates when no password set (nor provided)', done => {
      socket.on('authenticated', () => {
        expect(password.set.mock.calls.length).toBe(0);
        done();
      });

      socket.emit('authenticate', {
        callId: 'call4',
      });
    });

    it('no longer responds to "authenticate" after authenticated');

  });

  describe('join', () => {

    beforeEach(() => handleSocket(socket, io));

    it('emits permission-denied when not authenticated', done => {
      socket.on('permission-denied', () => done());
      socket.emit('join');
    });

    it('emits users to room when authenticated', () => {
      socket.authenticated = true;
      socket.room = 'call3';
      socket.emit('join');

      expect(rooms['call3'].emit.mock.calls.length).toBe(1);
      expect(rooms['call3'].emit.mock.calls[0][0]).toBe('users');
      expect(rooms['call3'].emit.mock.calls[0][1].initiator).toBe('/#socket0');
      expect(rooms['call3'].emit.mock.calls[0][1].users).toEqual([{
        id: '/#socket0'
      }, {
        id: '/#socket1'
      }, {
        id: '/#socket2'
      }]);
    });

  });

  describe('socket events', () => {

    describe('signal', () => {

      beforeEach(done => {
        handleSocket(socket, io);
        socket.on('authenticated', () => {
          io.to.mockClear();
          done();
        });
        socket.emit('authenticate', {
          callId: 'call1',
          password: 'password'
        });
      });

      it('should broadcast signal to specific user', () => {
        let signal = { type: 'signal' };

        socket.emit('signal', { userId: 'a', signal });

        expect(io.to.mock.calls).toEqual([[ 'a' ]]);
        expect(io.to('a').emit.mock.calls).toEqual([[
          'signal', {
            userId: '/#socket0',
            signal
          }
        ]]);
      });

    });

  });

});

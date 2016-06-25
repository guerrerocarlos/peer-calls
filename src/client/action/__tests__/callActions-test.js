jest.unmock('../callActions.js');
jest.mock('../../socket.js', () => {
  return {
    emit: jest.genMockFunction()
  };
});

const callActions = require('../callActions.js');
const socket = require('../../socket.js');
const callIdStore = require('../../store/callIdStore.js');

describe('callActions', () => {

  describe('join', () => {

    it('dispatches "authenticate" socket event', () => {
      callIdStore.getCallId.mockReturnValue('call123');
      callActions.join('passw0rd');
      expect(socket.emit.mock.calls.length).toBe(1);
      expect(socket.emit.mock.calls[0][0]).toBe('authenticate');
      expect(socket.emit.mock.calls[0][1]).toEqual({
        callId: 'call123',
        password: 'passw0rd'
      });
    });

  });

});

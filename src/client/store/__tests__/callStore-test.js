jest.unmock('../callStore.js');

const dispatcher = require('../../dispatcher/dispatcher.js');
const callStore = require('../callStore.js');

describe('dispatcher', () => {

  let handleAction, onChange;
  beforeEach(() => {
    handleAction = dispatcher.register.mock.calls[0][0];
    handleAction({ type: 'alert-clear' });

    onChange = jest.genMockFunction();
    callStore.addListener(onChange);
  });

  afterEach(() => {
    callStore.removeListener(onChange);
  });

});

const EventEmitter = require('events');
const debug = require('debug')('peer-calls:instructionsStore');
const dispatcher = require('../dispatcher/dispatcher.js');

const emitter = new EventEmitter();
const addListener = cb => emitter.on('change', cb);
const removeListener = cb => emitter.removeListener('change', cb);

let index = 0;
let instructions = [];

function dismiss(instruction) {
  let index = instructions.indexOf(instruction);
  if (index < 0) return;
  instructions.splice(index, 1);
  clearTimeout(instruction._timeout);
  delete instruction._timeout;
}

function emitChange() {
  emitter.emit('change');
}

const handlers = {
  instruct: ( instruct ) => {
    let instruction = instruct.notification
    index++;
    debug('instruct!', instruction.message);
    instruction._id = index;
    instructions.push(instruction);
    instruction._timeout = setTimeout(() => {
      debug('instruction-dismiss timeout: %s', instruction.message);
      dismiss(instruction);
      emitChange();
    }, 10000);
  },
  'instruction-dismiss': ({ instruction }) => {
    debug('instruction-dismiss: %s', instruction.message);
    dismiss(instruction);
  },
  'instruction-clear': () => {
    debug('instruction-clear');
    instructions = [];
  }
};

const dispatcherIndex = dispatcher.register(action => {
  let handle = handlers[action.type];
  if (!handle) return;
  handle(action);
  emitChange();
});

function getInstructions(max) {
  if (!max) max = instructions.length;
  let start = instructions.length - max;
  if (start < 0) start = 0;
  return instructions.slice(start, instructions.length);
}

module.exports = {
  dispatcherIndex,
  addListener,
  removeListener,
  getInstructions
};

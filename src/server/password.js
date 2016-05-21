/**
 * @module server/password
 */
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));
const db = require('./db.js');

const SALT_ROUNDS = 10;

/**
 * @param {Object} credentials
 * @param {String} credentials.callId
 * @param {String} credentials.password
 * @param {String} [credentials.oldPassword]
 * @static
 */
function set(credentials) {
  let oldPassword = credentials.oldPassword || '';
  let callId = credentials.callId;
  return verify(callId, oldPassword)
  .then(() => _setPassword(callId, credentials.password));
}

function _setPassword(callId, password) {
  return bcrypt.hashAsync(password, SALT_ROUNDS)
  .then(hash => {
    let filter = { callId };
    let update = { $set: { password: hash } };
    let options = { upsert: true };
    return db.collection('passwords').updateOneAsync(filter, update, options);
  });
}

/**
 * Verify password for callId
 * @param {Object} credentials
 * @param {String} credentials.callId
 * @param {String} credentials.password
 * @param {String} [credentials.oldPassword]
 * @static
 */
function verify(credentials) {

  return _validateCredentials(credentials)
  .then(() => {
    let callId = credentials.callId;
    let password = credentials.password;

    return db.collection('passwords').findOneAsync({ callId: callId })
    .then(call => {
      if (!call || !call.password) return true;
      return bcrypt.compareAsync(password, call.password);
    });
  })
  .then(ok => {
    if (!ok) throw new Error('Invalid credentials');
  });
}

function _validateCredentials(credentials) {
  return Promise.resolve()
  .then(() => {
    if (!credentials || !credentials.callId) {
      throw new Error('Invalid credentials');
    }
  });
}

/**
 * Checks if call requires password
 * @param {String} callId
 * @returns Boolean true if call requires password, false otherwise
 * @static
 */
function isRequired(callId) {
  return _validateCredentials({ callId })
  .then(() => db.collection('passwords').findOneAsync({ callId }))
  .then(call => call && call.password);
}

module.exports = { set, isRequired, verify };

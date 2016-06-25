const Promise = require('bluebird');
const mongo = Promise.promisifyAll(require('mongodb'));
module.exports = mongo;

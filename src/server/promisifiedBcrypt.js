const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));
module.exports = bcrypt;

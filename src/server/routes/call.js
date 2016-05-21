#!/usr/bin/env node
'use strict';
const debug = require('debug')('peer-calls:call');
const password = require('../password.js');
const router = require('express').Router();
const uuid = require('uuid');

router.get('/', (req, res) => {
  let prefix = 'call/';
  if (req.originalUrl.charAt(req.originalUrl.length - 1) === '/') prefix = '';
  res.redirect(prefix + uuid.v4());
});

router.get('/:callId', (req, res) => {
  let callId = req.params.callId;
  password.isRequired(callId)
  .then(passwordRequired => {
    res.render('call', {
      passwordRequired: passwordRequired,
      callId: encodeURIComponent(callId)
    });
  })
  .catch(err => {
    let errorId = uuid.v4();
    debug('err %s, %s', errorId, err.stack);
    res.status(500).send('Internal Server Error ' + errorId + ' - sorry :(');
  });
});

module.exports = router;

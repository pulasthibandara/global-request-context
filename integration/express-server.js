/* eslint-disable import/no-extraneous-dependencies */
require('zone.js');
const express = require('express');
const requestContext = require('../');
const expressContext = require('../lib/express-middleware');

const app = express();

app.use(expressContext);

app.use('/', () => {
  setTimeout(() => {
    const { req, res } = requestContext;
    res.send(req.query.q);
  }, 100);
});

const listener = app.listen(() => {
  const message = `started server on port: ${listener.address().port}`;
  typeof process.send === 'function' ?
    process.send(message) : process.stdout.write(message);
});

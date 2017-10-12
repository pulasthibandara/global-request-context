/* eslint-disable import/no-extraneous-dependencies */
require('zone.js');
const { isFunction } = require('util');
const Koa = require('koa');
const requestContext = require('../');
const koaContext = require('../lib/koa-middleware');

const app = new Koa();

app.use(koaContext);

app.use(() => {
  const { request, response } = requestContext;
  return new Promise((resolve) => {
    setTimeout(() => {
      response.body = request.query.q;
      resolve();
    }, 200);
  });
});

const listener = app.listen(() => {
  const message = `started server on port: ${listener.address().port}`;
  isFunction(process.send) ?
    process.send(message) : process.stdout.write(message);
});

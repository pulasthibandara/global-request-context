/* eslint-disable import/no-extraneous-dependencies */
const { promisify } = require('util');
const { expect } = require('chai');
const { fork } = require('child_process');
const http = require('http');

const makeRequest = promisify((port, query, cb) => {
  const req = http.request(
    { port: Number(port), path: `/?q=${query}` },
    ((res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        cb(null, data);
      });
    }),
  );

  req.on('error', (err) => {
    cb(err);
  });

  req.end();
});

describe('Koa server', () => {
  let server;
  let port;

  before((done) => {
    server = fork('./koa-server', [], { cwd: __dirname });
    server.once('message', (data) => {
      [, port] = data.match(/: (\d+)/);
      done();
    });
  });

  after(() => {
    expect(server.killed).to.be.true;
  });

  it('runs the express server on a port', () => {
    expect(Number(port)).to.satisfy(Number.isInteger);
  });

  it('responds with given query param', async () => {
    const query = Math.random().toString().split('.')[1];

    const data = await makeRequest(port, query);
    expect(data).to.equal(query);
  });

  it('works with concurrent requests', async () => {
    const query1 = Math.random().toString().split('.')[1];
    const query2 = Math.random().toString().split('.')[1];
    const query3 = Math.random().toString().split('.')[1];

    const data = await Promise.all([
      makeRequest(port, query1),
      makeRequest(port, query2),
      makeRequest(port, query3),
    ]);

    expect(data).to.deep.equal([query1, query2, query3]);
  });

  it('exits gracefully', (done) => {
    server.kill();
    server.once('exit', (code) => {
      expect(code).to.be.null;
      done();
    });
  });
});

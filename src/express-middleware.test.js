const sinon = require('sinon');
const { expect } = require('chai');
const expressMiddleware = require('./express-middleware');
const requestContext = require('./');

describe('Express middleware', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => sandbox.restore());

  it('forks a new zone with the current context', () => {
    const req = {};
    const res = {};
    const next = () => {};

    sandbox.stub(Zone.current, 'fork').returns({ run() { } });
    expressMiddleware(req, res, next);
    expect(Zone.current.fork).to.have.been.calledWith({
      name: 'request-context',
      properties: { requestContext: { req, res } },
    });
  });

  it('runs the forked zone', () => {
    const run = sandbox.spy();

    sandbox.stub(Zone.current, 'fork').returns({ run });
    expressMiddleware();
    expect(run).to.have.been.calledWith(sinon.match.func);
  });

  it('calls the next() callback', () => {
    const req = {};
    const res = {};
    const next = sandbox.spy();

    sandbox.stub(Zone.current, 'fork').returns({ run: cb => cb() });
    expressMiddleware(req, res, next);
    expect(next).to.have.been.called;
  });
});

describe('Express request context', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => sandbox.restore());

  it('can retrieve stored request context from the zone', (done) => {
    const req = {};
    const res = {};
    const next = () => {
      expect(Zone.current.get('requestContext')).to.deep.equal({ req, res });
      done();
    };

    expressMiddleware(req, res, next);
  });

  it('can retrieve stored request context in an asynchronous method', (done) => {
    const req = {};
    const res = {};
    const next = () => {
      setTimeout(() => {
        expect(Zone.current.get('requestContext')).to.deep.equal({ req, res });
        done();
      }, 10);
    };

    expressMiddleware(req, res, next);
  });

  it('can retrieve stored request context for multiple requests', () => {
    const req1 = { data: 'req1' };
    const res1 = { data: 'res1' };
    const req2 = { data: 'req2' };
    const res2 = { data: 'res2' };

    let resolve1;
    let resolve2;
    const promise1 = new Promise((r) => { resolve1 = r; });
    const promise2 = new Promise((r) => { resolve2 = r; });


    const next1 = () => {
      setTimeout(() => {
        expect(Zone.current.get('requestContext'))
          .to.deep.equal({ req: req1, res: res1 });
        resolve1();
      }, 15);
    };

    const next2 = () => {
      setTimeout(() => {
        expect(Zone.current.get('requestContext'))
          .to.deep.equal({ req: req2, res: res2 });
        resolve2();
      }, 10);
    };

    expressMiddleware(req1, res1, next1);
    expressMiddleware(req2, res2, next2);

    return Promise.all([promise1, promise2]);
  });

  it('can access request context by require', (done) => {
    const req = {};
    const res = {};
    const next = () => {
      setTimeout(() => {
        expect(requestContext.req).to.equal(req);
        expect(requestContext.res).to.equal(res);
        done();
      }, 10);
    };

    expressMiddleware(req, res, next);
  });

  it('can get request context by require for multiple requests', () => {
    const req1 = { data: 'req1' };
    const res1 = { data: 'res1' };
    const req2 = { data: 'req2' };
    const res2 = { data: 'res2' };

    let resolve1;
    let resolve2;
    const promise1 = new Promise((r) => { resolve1 = r; });
    const promise2 = new Promise((r) => { resolve2 = r; });


    const next1 = () => {
      setTimeout(() => {
        expect(requestContext.req).to.equal(req1);
        expect(requestContext.res).to.equal(res1);
        resolve1();
      }, 15);
    };

    const next2 = () => {
      setTimeout(() => {
        expect(requestContext.req).to.equal(req2);
        expect(requestContext.res).to.equal(res2);
        resolve2();
      }, 10);
    };

    expressMiddleware(req1, res1, next1);
    expressMiddleware(req2, res2, next2);

    return Promise.all([promise1, promise2]);
  });
});

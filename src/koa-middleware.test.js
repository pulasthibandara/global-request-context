const sinon = require('sinon');
const { expect } = require('chai');
const koaMiddleware = require('./koa-middleware');
const requestContext = require('./');

describe('Koa middleware', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => sandbox.restore());

  it('forks a new zone with the current context', () => {
    const ctx = {};
    const next = () => {};

    sandbox.stub(Zone.current, 'fork').returns({ run() { } });
    koaMiddleware(ctx, next);
    expect(Zone.current.fork).to.have.been.calledWith({
      name: 'express-context',
      properties: { requestContext: ctx },
    });
  });

  it('runs the forked zone', () => {
    const run = sandbox.spy();

    sandbox.stub(Zone.current, 'fork').returns({ run });
    koaMiddleware();
    expect(run).to.have.been.calledWith(sinon.match.func);
  });

  it('calls the next() callback', () => {
    const ctx = {};
    const next = sandbox.spy();

    sandbox.stub(Zone.current, 'fork').returns({ run: cb => cb() });
    koaMiddleware(ctx, next);
    expect(next).to.have.been.called;
  });
});

describe('Koa request context', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => sandbox.restore());

  it('can retrieve stored request context from the zone', (done) => {
    const ctx = {};
    const next = () => {
      expect(Zone.current.get('requestContext')).to.deep.equal(ctx);
      done();
    };

    koaMiddleware(ctx, next);
  });

  it('can retrieve stored request context in an asynchronous method', (done) => {
    const ctx = {};
    const next = () => {
      setTimeout(() => {
        expect(Zone.current.get('requestContext')).to.deep.equal(ctx);
        done();
      }, 10);
    };

    koaMiddleware(ctx, next);
  });

  it('can retrieve stored request context for multiple requests', () => {
    const ctx1 = { data: 'ctx1' };
    const ctx2 = { data: 'ctx2' };

    let resolve1;
    let resolve2;
    const promise1 = new Promise((r) => { resolve1 = r; });
    const promise2 = new Promise((r) => { resolve2 = r; });


    const next1 = () => {
      setTimeout(() => {
        expect(Zone.current.get('requestContext'))
          .to.deep.equal(ctx1);
        resolve1();
      }, 15);
    };

    const next2 = () => {
      setTimeout(() => {
        expect(Zone.current.get('requestContext'))
          .to.deep.equal(ctx2);
        resolve2();
      }, 10);
    };

    koaMiddleware(ctx1, next1);
    koaMiddleware(ctx2, next2);

    return Promise.all([promise1, promise2]);
  });

  it('can access request context by require', (done) => {
    const ctx = { data: '1' };
    const next = () => {
      setTimeout(() => {
        expect(requestContext.data).to.equal(ctx.data);
        done();
      }, 10);
    };

    koaMiddleware(ctx, next);
  });

  it('can get request context by require for multiple requests', () => {
    const ctx1 = { data: 'ctx1' };
    const ctx2 = { data: 'ctx2' };

    let resolve1;
    let resolve2;
    const promise1 = new Promise((r) => { resolve1 = r; });
    const promise2 = new Promise((r) => { resolve2 = r; });


    const next1 = () => {
      setTimeout(() => {
        expect(requestContext.data).to.equal(ctx1.data);
        resolve1();
      }, 15);
    };

    const next2 = () => {
      setTimeout(() => {
        expect(requestContext.data).to.equal(ctx2.data);
        resolve2();
      }, 10);
    };

    koaMiddleware(ctx1, next1);
    koaMiddleware(ctx2, next2);

    return Promise.all([promise1, promise2]);
  });
});

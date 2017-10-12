const sinon = require('sinon');
const { expect } = require('chai');
const requestContext = require('./');

function runInZone(ctx, cb) {
  return new Promise((resolve) => {
    Zone.current
      .fork({ name: 'request-context', properties: { requestContext: ctx } })
      .run(() => cb(resolve));
  });
}

describe('Request Context', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => sandbox.restore());

  it('can retrieve from the request zone', () =>
    runInZone({ data: 'stuff' }, (resolve) => {
      expect(requestContext.data).to.equal('stuff');
      resolve();
    }));

  it('can retrieve from the request zone asynchronously', () =>
    runInZone({ data: 'stuff' }, (resolve) => {
      setTimeout(() => {
        expect(requestContext.data).to.equal('stuff');
        resolve();
      }, 10);
    }));

  it('retrievs multiple contexts asynchronously', () =>
    Promise.all([
      runInZone({ data: 'stuff' }, (resolve) => {
        setTimeout(() => {
          expect(requestContext.data).to.equal('stuff');
          resolve();
        }, 15);
      }),

      runInZone({ data: 'stuff' }, (resolve) => {
        setTimeout(() => {
          expect(requestContext.data).to.equal('stuff');
          resolve();
        }, 10);
      }),
    ]));

  it('can return the full context object', () => {
    const context = { data: 'stuff' };
    runInZone(context, (resolve) => {
      setTimeout(() => {
        expect(requestContext.retrieve()).to.equal(context);
        resolve();
      }, 10);
    });
  });
});

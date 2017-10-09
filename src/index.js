/**
 * @type {{ [key:string]: any, retrieve: (() => any) }}
 */
const context = new Proxy({}, {
  get(target, propertyKey, reciever) {
    const ctx = Zone.current.get('requestContext');
    if (!ctx) throw new Error('no context fuund!');

    if (propertyKey === 'retrieve') {
      return () => ctx;
    }

    return Reflect.get(ctx, propertyKey, reciever);
  },
});

module.exports = context;

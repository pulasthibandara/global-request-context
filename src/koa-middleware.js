module.exports = (ctx, next) => {
  const requestContext = ctx;
  Zone.current
    .fork({ name: 'request-context', properties: { requestContext } })
    .run(() => {
      next();
    });
};

module.exports = (ctx, next) => {
  const requestContext = ctx;
  Zone.current
    .fork({ name: 'express-context', properties: { requestContext } })
    .run(() => {
      next();
    });
};

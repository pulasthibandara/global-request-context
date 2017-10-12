module.exports = async (ctx, next) => {
  const requestContext = ctx;
  return Zone.current
    .fork({ name: 'request-context', properties: { requestContext } })
    .run(async () => {
      await next();
    });
};

module.exports = (req, res, next) => {
  const requestContext = { req, res };
  Zone.current
    .fork({ name: 'request-context', properties: { requestContext } })
    .run(() => {
      next();
    });
};

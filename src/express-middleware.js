module.exports = (req, res, next) => {
  const requestContext = { req, res };
  Zone.current
    .fork({ name: 'express-context', properties: { requestContext } })
    .run(() => {
      next();
    });
};

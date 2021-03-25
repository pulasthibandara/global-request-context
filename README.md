> # This library is unmaintained!

# Global Request Context
> A middleware that enables you to `require()` request context.

Tired of passing the request context through functions?
Need to get the current user session in that deeply nested function?
Or simply coming from PHP or .NET and don't wanna do it the node.js way?

This is the module for you...


But seriously, why?


The easy answer is... Just because you can!

## How to use

1. Register the middleware
```javascript
// server.js:express
const expressContext = require('global-request-context/lib/express-middleware');
...
app.use(expressContext);
```

```javascript
// server.js:koa
const koaContext = require('global-request-context/lib/koa-middleware');
...
app.use(koaContext);
```

2. Simply require the context in
```javascript
// fancy-service.js
// this is the request context koa/express
const requestContext = require('global-request-context');

function handleRequestExpress() {
  const { req, res } = requestContext;
  res.send(req.query.input);
}

function handleRequestKoa() {
  const { request, response } = requestContext;
  response.body = request.query.input;
}
```

3. Run the application with zone.js as a polyfill
```sh
# require zone.js at execution
node -r zone.js server.js
```

or

```javascript
// require zone.js as the first thing that you require
require('zone.js');
...
// rest of your app code
```

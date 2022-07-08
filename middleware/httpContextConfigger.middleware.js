const httpContext = require('express-http-context');

module.exports = (req, res, next) => {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  httpContext.set('method', req?.method);
  httpContext.set('url', req?.url);
  next();
};

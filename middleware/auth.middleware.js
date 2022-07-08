const httpContext = require('express-http-context');
const jwt = require('jsonwebtoken');
const logger = require('../services/logger')(module);
const config = require('../conf');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const decoded = jwt.verify(token, config.jwtKey);
    req.user = decoded.user;
    httpContext.set('user', decoded?.user);
    return next();
  } catch (error) {
    logger.error('Not authorized');
    return res.sendStatus(401);
  }
};

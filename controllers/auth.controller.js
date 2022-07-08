const jwt = require('jsonwebtoken');
const config = require('../conf');
const logger = require('../services/logger')(module);

module.exports = { get };

function get(req, res) {
  const { user, password } = req.query;
  if (user !== config.auth.username || password !== config.auth.password) {
    logger.error('No user passed');
    return res.status(400).json({ error: 'No user passed' });
  }
  const token = jwt.sign({ user }, config.jwtKey, { expiresIn: config.jwt_ttl });
  res.header('Authorization', `Bearer ${token}`);
  return res.sendStatus(200);
}

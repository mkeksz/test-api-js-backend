const config = require('./config.json');

module.exports = {
  ...config,
  auth: {
    username: process.env.AUTH_USERNAME || 'admin',
    password: process.env.AUTH_PASSWORD || '1234',
  },
  jwtKey: process.env.JWT_KEY || 'secret',
  isTest: process.env.NODE_ENV === 'test',
  isDev: process.env.NODE_ENV === 'development',
};

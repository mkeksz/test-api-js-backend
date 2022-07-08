const log4js = require('log4js');
const path = require('path');
const httpContext = require('express-http-context');
const logConfig = require('../conf').log;
const config = require('../conf');

const logAppenders = {
  file: { type: 'file', filename: logConfig.path },
};
if (logConfig.console) {
  logAppenders.console = { type: 'console' };
}

log4js.configure({
  appenders: logAppenders,
  categories: {
    default: {
      appenders: Object.keys(logAppenders),
      level: 'ALL',
    },
  },
});

module.exports = (callingModule) => {
  const parts = callingModule.filename.split(path.sep);
  const moduleLabel = parts[parts.length - 1];
  const log4jsLogger = log4js.getLogger(`${moduleLabel}`);
  let logger = {
    info: (message) => {
      log4jsLogger.info(_formatMessage(message));
    },
    error: (message) => {
      log4jsLogger.error(_formatMessage(message));
    },
    debug: (message) => {
      log4jsLogger.debug(_formatMessage(message));
    },
  };
  if (config.isTest) {
    logger = {
      info: () => {},
      error: () => {},
      debug: () => {},
    };
  }
  return logger;
};

function _formatMessage(error) {
  const user = httpContext.get('user');
  const method = httpContext.get('method');
  const url = httpContext.get('url');

  const messageArr = [];
  if (user) {
    messageArr.push(`User: ${user}`);
  }
  if (method) {
    messageArr.push(`${method}`);
  }
  if (url) {
    messageArr.push(`${url}`);
  }
  if (logConfig.debug && error instanceof Error) {
    messageArr.push(error.message + error.stack);
  } else {
    messageArr.push(error);
  }
  return messageArr.join(' -> ');
}

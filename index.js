const logger = require('./services/logger')(module);
const config = require('./conf');
const app = require('./app');

function start() {
  try {
    app.listen(config.port, () => {
      logger.info(`App has been started on port ${config.port}...`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

start();

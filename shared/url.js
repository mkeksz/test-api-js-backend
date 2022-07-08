const config = require('../conf');

function getFileURL(req, fileName) {
  const { port } = config;
  const url = `${req.protocol}://${req.hostname}${port === '80' || port === '443' ? '' : `:${port}`}`;
  return `${url}/images/${fileName}`;
}

module.exports = {
  getFileURL,
};

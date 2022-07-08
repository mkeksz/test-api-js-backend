module.exports = {
  env: {
    node: true,
    mocha: true,
  },
  extends: [
    'airbnb',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'script',
  },
  settings: {
    react: {
      version: '999.999.999',
    },
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'no-param-reassign': 'off',
  },
};

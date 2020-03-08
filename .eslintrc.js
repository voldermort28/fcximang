module.exports = {
  env: {
    browser: true,
    es6: true,
    mocha: true
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    app: 'writable',
    assert: 'writable',
    skrollr: 'writable',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-underscore-dangle': 0,
    'linebreak-style': 0,
    'no-param-reassign': ['error', { 'props': false }],
    'max-len': [0,'ignoreComments','ignoreTrailingComments','ignoreUrls','ignoreTemplateLiterals','ignoreRegExpLiterals','ignorePattern']
  },
};

const path = require('path');
const { getJasmineAliases } = require('../../alias.config');

require('../helpers/mock-styles');

require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      modules: 'commonjs'
    }],
    '@babel/preset-typescript',
    '@babel/preset-react'
  ],
  plugins: [
    ['module-resolver', {
      root: ['.'],
      alias: getJasmineAliases(),
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }]
  ]
});

// Load the environment setup
require(path.resolve(__dirname, '../../src/test/environment.js'));

module.exports = {
  spec_dir: "src/test/spec",
  spec_files: [
    "**/*.[tj]s?(x)"
  ],
  helpers: [
    "../../spec/helpers/**/*.[tj]s?(x)"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true
  }
}

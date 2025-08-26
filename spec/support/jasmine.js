const path = require('path');
const { getJasmineAliases } = require('../../alias.config');

require('../helpers/mock-styles');

require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  presets: ['react-app'],
  plugins: [
    ['module-resolver', {
      root: ['.'],
      alias: getJasmineAliases()
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

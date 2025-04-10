const path = require('path');

require('../helpers/mock-styles');

require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  presets: ['react-app'],
  plugins: [
    ['module-resolver', {
      root: ['.'],
      alias: {
        '@/store': './src/assets/ts/store.ts',
        '@/main': './src/assets/ts/main.ts',
        '@/components': './src/assets/ts/components',
        '@/features': './src/assets/ts/features',
        '@/scss': './src/assets/scss',
        '@/types': './src/assets/ts/types',
        '@/vendor': './src/lib/vendor',
        '@/test': './src/test'
      }
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

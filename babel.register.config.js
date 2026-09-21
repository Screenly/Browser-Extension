// Shared Babel configuration for the Jasmine test run. The webpack build uses
// ts-loader for TypeScript and its own babel-loader presets for plain JS.
module.exports = {
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};

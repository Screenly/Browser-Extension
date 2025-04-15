const path = require('path');
const fs = require('fs');

/**
 * Centralized configuration for import aliases
 * This file reads from tsconfig.json and provides aliases for webpack and Jasmine
 */

// Read paths from tsconfig.json
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
const tsPaths = tsconfig.compilerOptions.paths;

/**
 * Convert TypeScript paths to webpack aliases
 * @returns {Object} Webpack aliases
 */
function getWebpackAliases() {
  const webpackAliases = {};

  Object.entries(tsPaths).forEach(([key, value]) => {
    // Handle both file and directory aliases
    if (key.endsWith('/*')) {
      // Directory alias - remove the /* suffix
      const dirKey = key.replace('/*', '');
      webpackAliases[dirKey] = path.resolve(__dirname, value[0].replace('/*', ''));
    } else {
      // File alias
      webpackAliases[key] = path.resolve(__dirname, value[0]);
    }
  });

  return webpackAliases;
}

/**
 * Get aliases for Jasmine configuration
 * @returns {Object} Jasmine aliases
 */
function getJasmineAliases() {
  const jasmineAliases = {};

  Object.entries(tsPaths).forEach(([key, value]) => {
    // Get the base path without /* if it exists
    const basePath = value[0].replace('/*', '');

    // Get the alias key without /* if it exists
    const aliasKey = key.replace('/*', '');

    // Add ./ prefix to the path
    jasmineAliases[aliasKey] = `./${basePath}`;
  });

  return jasmineAliases;
}

module.exports = {
  getWebpackAliases,
  getJasmineAliases
};

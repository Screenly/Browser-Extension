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
 * Convert TypeScript paths to aliases
 * @param {boolean} useAbsolutePaths - Whether to use absolute paths (true for webpack, false for Jasmine)
 * @returns {Object} Aliases with appropriate paths
 */
function getAliases(useAbsolutePaths = true) {
  const aliases = {};

  Object.entries(tsPaths).forEach(([key, value]) => {
    // Get the base path without /* if it exists
    const basePath = value[0].replace('/*', '');

    // Get the alias key without /* if it exists
    const aliasKey = key.replace('/*', '');

    // Use absolute paths for webpack and relative paths for Jasmine
    aliases[aliasKey] = useAbsolutePaths
      ? path.resolve(__dirname, basePath)
      : `./${basePath}`;
  });

  return aliases;
}

// Export specific versions for webpack and Jasmine
const getWebpackAliases = () => getAliases(true);
const getJasmineAliases = () => getAliases(false);

module.exports = {
  getWebpackAliases,
  getJasmineAliases
};

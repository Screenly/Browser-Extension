import jasmine from 'eslint-plugin-jasmine';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jasmine/recommended',
    'plugin:@typescript-eslint/recommended'
  ),
  {
    ignores: [
      'src/lib/vendor/',
      'node_modules/',
      'dist/',
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx}'],
    plugins: {
      jasmine,
      '@typescript-eslint': tseslint,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    languageOptions: {
      parser: tsparser,
      globals: {
        ...globals.browser,
        ...globals.jasmine,
        ...globals.node,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        React: 'readonly',
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
    },
  }
];

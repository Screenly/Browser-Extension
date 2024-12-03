import jasmine from "eslint-plugin-jasmine";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jasmine/recommended"
  ),
  {
    ignores: [
      "src/lib/vendor/",
      "node_modules/",
      "dist/",
    ]
  },
  {
    plugins: {
      jasmine,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jasmine,
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },

      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {},
  }
];

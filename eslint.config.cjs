/** @type {import('eslint').Linter.FlatConfig[]} */
const tsParser = require("@typescript-eslint/parser");
const tsEslint = require("@typescript-eslint/eslint-plugin");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const jsxA11y = require("eslint-plugin-jsx-a11y");
const importPlugin = require("eslint-plugin-import");

module.exports = [
  // Remplace .eslintignore (ESLint v9)
  { ignores: ["node_modules/**", ".next/**", "dist/**", "coverage/**"] },

  // TS + React sans "project" => pas de recherche tsconfig
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-extra-semi": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "import/order": ["warn", {
        groups: ["builtin","external","internal","parent","sibling","index","object","type"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true }
      }],
    },
  },
];

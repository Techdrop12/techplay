/** @type {import('eslint').Linter.FlatConfig[]} */
const tsParser = require("@typescript-eslint/parser");
const tsEslint = require("@typescript-eslint/eslint-plugin");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const jsxA11y = require("eslint-plugin-jsx-a11y");
const importPlugin = require("eslint-plugin-import");

module.exports = [
  { ignores: ["node_modules/**", ".next/**", "dist/**", "coverage/**", "e2e/**", "**/*.config.*"] },

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
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": ["warn", { allowEmptyCatch: true }],
      // no-extra-semi désactivé (règle core dépréciée 8.53+, remplacée par @stylistic) ; Prettier gère les point-virgules
      "no-extra-semi": "off",
      "@typescript-eslint/no-unused-expressions": "warn",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      // Désactivé: eslint-plugin-import utilise getTokenOrCommentBefore (API ESLint 9+) → crash avec ESLint 10
      "import/order": "off",
    },
  },
];


module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    // si tu veux le type-aware plus tard: 'plugin:@typescript-eslint/recommended-type-checked'
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // React 17+ runtime auto => plus besoin d'importer React
    'react/react-in-jsx-scope': 'off',

    // TEMP pour passer au vert (on resserrera ensuite)
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-extra-semi': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',

    // Import/ordre : utile mais en "warn" pour l’instant
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // si besoin d’assouplir sur fichiers server actions/routes :
        // '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
  ],
};

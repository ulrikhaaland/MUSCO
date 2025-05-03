module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    requireConfigFile: false,
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
    '/generated/**/*', // Ignore generated files.
  ],
  plugins: ['import'],
  rules: {
    'quotes': ['error', 'single'],
    'import/no-unresolved': 0,
    'indent': ['error', 2],
    'max-len': 'off',
    'brace-style': ['error', '1tbs', {'allowSingleLine': true}],
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', {'argsIgnorePattern': '^_'}],
      },
    },
  ],
};

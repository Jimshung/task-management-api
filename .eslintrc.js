module.exports = {
  extends: ['@loopback/eslint-config', 'plugin:import/typescript'],
  plugins: ['import'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public',
          methods: 'explicit',
          properties: 'explicit',
          parameterProperties: 'explicit',
        },
      },
    ],
    '@typescript-eslint/explicit-function-return-type': ['error'],
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/prefer-nullish-coalescing': ['error'],
    '@typescript-eslint/prefer-optional-chain': ['error'],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['property', 'method', 'parameter', 'typeProperty'],
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        filter: {
          regex:
            '^(is_completed|completed_at|deleted_at|application/json|Content-Type|fk_|idx_|Todo-Item|TABLE_|Field|Type|Null|Key|Default|Extra)$',
          match: false,
        },
        leadingUnderscore: 'allow',
      },
    ],
    'import/extensions': ['off'],
    'import/no-extraneous-dependencies': ['off'],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: true,
    },
  },
};

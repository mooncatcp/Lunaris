module.exports = {
  'env': {
    'es2021': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'never',
    ],
    'block-spacing': [
      'error',
      'always',
    ],
    'array-bracket-spacing': [
      'error',
      'always',
    ],
    'eqeqeq': [
      'error',
      'always',
    ],
    'no-multi-spaces': [
      'error',
    ],
    'object-curly-spacing': [
      1, 'always',
    ],
    'indent': [ 'error', 2 ],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        'multiline': {
          'delimiter': 'none',
          'requireLast': true,
        },
      },
    ],
    'comma-dangle': [ 'error', 'always-multiline' ],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'keyword-spacing': [ 'error', { 'before': true, 'after': true } ],
    'max-len': [ 'error', { 'code': 120, 'ignoreComments': true } ],
    'spaced-comment': [ 'error', 'always' ],
    'prefer-promise-reject-errors': [ 'error' ],
    '@typescript-eslint/no-unused-vars': [ 'error', { vars: 'all', args: 'none' } ],
    'no-duplicate-imports': [ 'error' ],
  },
}
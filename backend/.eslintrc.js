module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['airbnb-base', 'prettier/@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['prettier', '@typescript-eslint'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts']
      }
    }
  },
  rules: {
    'import/extensions': 'off',
    'no-undef': 'off',
    'no-param-reassign': 'off',
    'import/no-unresolved': 'off',
    'no-unused-vars': 'off',
    'comma-dangle': 'off',
    'import/prefer-default-export': 'off',
    'linebreak-style': 'off'
  }
};

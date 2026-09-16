const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const legacyConfig = require('./.eslintrc.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  {
    ignores: [
      'build/**',
      'src/assets/**',
      'public/**',
      'dist/**',
      'node_modules/**'
    ]
  },
  ...compat.config({
    ...legacyConfig,
    extends: ['plugin:vue/recommended', 'eslint:recommended'],
    parserOptions: {
      ecmaVersion: 2022
    },
    rules: {
      ...legacyConfig.rules,
      'no-unused-vars': [2, {
        vars: 'all',
        args: 'none',
        caughtErrors: 'none'
      }]
    }
  })
]

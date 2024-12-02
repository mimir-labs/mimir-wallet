// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'import', 'react-prefer-function-component', 'header', 'simple-import-sort'],
  ignorePatterns: [
    '**/dist/*',
    '**/build/*',
    '**/build-*/*',
    '**/coverage/*',
    '**/node_modules/*',
    '.github/**',
    '.vscode/**',
    '/.eslintrc.cjs',
    '/.eslintrc.js',
    '/.eslintrc.mjs',
    '/.prettierrc.js'
  ],
  extends: [
    'eslint:all',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:react/jsx-runtime',
    'plugin:react-prefer-function-component/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    'no-dupe-else-if': 'error',
    'no-underscore-dangle': 'off',
    'no-nested-ternary': 'off',
    'no-promise-executor-return': 'off',
    'no-unreachable-loop': 'error',
    'no-param-reassign': 'off',
    'no-useless-backreference': 'error',
    'require-atomic-updates': 'error',
    'default-case-last': 'error',
    'grouped-accessor-pairs': 'error',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'max-classes-per-file': 'off',
    'no-constructor-return': 'error',
    'no-implicit-coercion': 'error',
    'no-constant-condition': 'off',
    'prefer-regex-literals': 'error',
    'capitalized-comments': 'error',
    'consistent-return': 'off',
    'prefer-destructuring': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.'
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
      }
    ],
    'no-void': 'off',
    'no-console': 'off',
    'no-continue': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/padding-line-between-statements': 'off',
    '@typescript-eslint/prefer-enum-initializers': 'off',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/prefer-regexp-exec': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/init-declarations': 'off',
    '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-implicit-any-catch': 'off',
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/prefer-includes': 'off',
    '@typescript-eslint/no-restricted-imports': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'react/require-default-props': 'off',
    'react/no-did-update-set-state': 'off',
    'react/no-find-dom-node': 'off',
    'react/no-is-mounted': 'off',
    'react/no-redundant-should-component-update': 'off',
    'react/no-render-return-value': 'off',
    'react/no-string-refs': 'off',
    'react/no-this-in-sfc': 'off',
    'react/no-will-update-set-state': 'off',
    'react/prefer-es6-class': 'off',
    'react/no-unused-state': 'off',
    'react/prefer-stateless-function': 'off',
    'react/require-render-return': 'off',
    'react/sort-comp': 'off',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    'react/no-unescaped-entities': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration'
      }
    ],
    'react/jsx-key': 'error',
    'react/jsx-no-bind': [
      'error',
      {
        ignoreRefs: false,
        allowArrowFunctions: true,
        allowFunctions: true,
        allowBind: false,
        ignoreDOMComponents: false
      }
    ],
    'react/jsx-no-constructed-context-values': 'error',
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-useless-fragment': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-array-index-key': 'off',
    'react-hooks/exhaustive-deps': ['error', {
      additionalHooks: '(useAsyncFn|useDebounceFn)'
    }],
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'import/no-deprecated': 'error',
    'import/order': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-mutable-exports': 'off',
    'import/no-cycle': 'off',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: '*', next: 'try' },
      { blankLine: 'always', prev: 'try', next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: '*', next: 'import' },
      { blankLine: 'always', prev: 'import', next: '*' },
      { blankLine: 'any', prev: 'import', next: 'import' }
    ],
    'header/header': [2, 'line', [' Copyright 2023-2024 dev.mimir authors & contributors', ' SPDX-License-Identifier: Apache-2.0'], 2],
    'simple-import-sort/imports': [
      2,
      {
        groups: [
          ['^\u0000'], // all side-effects (0 at start)
          ['\u0000$', '^@mimir-wallet.*\u0000$', '^\\..*\u0000$'], // types (0 at end)
          ['^[^/\\.]'], // non-mimir-wallet
          ['^@mimir-wallet'], // mimir-wallet
          ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'] // local (. last)
        ]
      }
    ]
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ['src/**/*.ts?(x)'],
      parserOptions: {
        project: ['./tsconfig.json']
      }
    },
    {
      files: ['vite.config.ts', 'cypress.config.ts'],
      parserOptions: {
        project: ['./tsconfig.node.json']
      }
    },
    {
      files: ['**/__tests__/**/*.ts?(x)'],
      extends: ['plugin:testing-library/react'],
      rules: {
        '@typescript-eslint/no-magic-numbers': ['off'],
        'testing-library/no-await-sync-events': [
          'error',
          {
            eventModules: ['fire-event']
          }
        ],
        'testing-library/no-manual-cleanup': 'error',
        'testing-library/prefer-explicit-assert': 'error',
        'testing-library/prefer-user-event': 'error'
      }
    }
  ]
};

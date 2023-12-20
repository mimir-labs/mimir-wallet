// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

const base = require('@mimirdev/dev/config/eslint.cjs');

module.exports = {
  ...base,
  ignorePatterns: [
    '**/dist/*',
    '**/build/*',
    '**/build-*/*',
    '**/coverage/*',
    '**/node_modules/*',
    '.github/**',
    '.vscode/**',
    '.yarn/**',
    '/.eslintrc.cjs',
    '/.eslintrc.js',
    '/.eslintrc.mjs'
  ],
  parserOptions: {
    ...base.parserOptions,
    project: [
      './tsconfig.json'
    ]
  },
  rules: {
    ...base.rules,
  }
};

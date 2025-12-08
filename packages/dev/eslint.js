// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import js from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import { defineConfig } from 'eslint/config';
import headers from 'eslint-plugin-headers';
import { importX } from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      'dist/*',
      'build/*',
      '**/dist/*',
      '**/build/*',
      '.turbo/*',
      '**/.turbo',
    ],
  },

  // Base JS config
  js.configs.recommended,

  // TypeScript configs
  tseslint.configs.recommended,

  reactRefresh.configs.vite,

  // TanStack Query
  ...pluginQuery.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      react: react,
      'import-x': importX,
      headers,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/prop-types': 'off', // TypeScript handles prop validation
      // React Hooks (includes React Compiler rules in v7+)
      ...reactHooks.configs.recommended.rules,
      // TypeScript
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      'react-hooks/exhaustive-deps': [
        'error',
        {
          additionalHooks: '(useAsyncFn|useDebounceFn)',
        },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'function' },
        { blankLine: 'always', prev: 'function', next: '*' },
        { blankLine: 'always', prev: '*', next: 'try' },
        { blankLine: 'always', prev: 'try', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'import' },
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
      ],
      // Import sorting and organization
      'import-x/no-deprecated': 'error',
      'import-x/no-cycle': [
        'error',
        {
          maxDepth: Infinity,
          ignoreExternal: true,
          allowUnsafeDynamicCyclicDependency: false,
        },
      ],
      'import-x/order': [
        'error',
        {
          groups: [
            'type',
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',
      'headers/header-format': [
        'error',
        {
          source: 'string',
          style: 'line',
          content:
            'Copyright {startYear}-{endYear} dev.mimir authors & contributors\nSPDX-License-Identifier: Apache-2.0',
          trailingNewlines: 2,
          variables: {
            startYear: '2023',
            endYear: '2025',
          },
        },
      ],
    },
  },
  prettier,
);

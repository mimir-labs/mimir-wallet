#!/usr/bin/env node
// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { spawn } from 'node:child_process';

const args = [
  '--cache',
  '--cache-location',
  'node_modules/.cache/eslint/',
  ...process.argv.slice(2),
];

const child = spawn('eslint', args, {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config';

/**
 * Integration test configuration for polkadot-core
 * Uses real RPC connections to Paseo testnet
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tests/unit/**'],
    testTimeout: 60000,
    hookTimeout: 120000,
    fileParallelism: false,
    setupFiles: ['tests/integration/global-setup.ts', 'tests/integration/setup.ts']
  }
});

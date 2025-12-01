// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { vitestConfig } from '@mimir-wallet/dev/vitest.config.base.js';
import { mergeConfig } from 'vitest/config';

export default mergeConfig(vitestConfig, {
  test: {
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tests/integration/**']
  }
});

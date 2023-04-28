// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

const config = require('@mimirdev/dev/config/jest.cjs');

module.exports = {
  ...config,
  moduleNameMapper: {},
  testTimeout: 30000
};

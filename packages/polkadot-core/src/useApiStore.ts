// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiProps } from './types.js';

import { create } from 'zustand';

export const useAllApis = create<{ chains: Record<string, ApiProps> }>()(() => ({
  chains: {}
}));

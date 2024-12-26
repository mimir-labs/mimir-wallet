// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiProps } from '@mimir-wallet/api/types';

import { create } from 'zustand';

export const useApi = create<ApiProps>()(
  () =>
    ({
      isApiConnected: false,
      isApiInitialized: false,
      apiError: null,
      isApiReady: false,
      tokenSymbol: '',
      metadata: {},
      identityApi: null
    }) as unknown as ApiProps
);

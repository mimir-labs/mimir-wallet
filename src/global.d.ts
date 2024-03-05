// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {} from '@polkadot/api-augment/substrate';
import type { Injected } from '@polkadot/extension-inject/types';

declare global {
  interface Window {
    walletExtension?: { isNovaWallet?: boolean };
    injectedWeb3?: Record<
      string,
      {
        enable: (origin: string) => Promise<Injected>;
        version: string;
      }
    >;
  }
}

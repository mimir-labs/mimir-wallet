// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected } from '@polkadot/extension-inject/types';
import type { Endpoint } from './config';

declare global {
  interface Window {
    currentChain: Endpoint;
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

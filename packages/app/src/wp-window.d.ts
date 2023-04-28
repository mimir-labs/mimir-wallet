// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface Window {
  ethereum?: {
    isMetaMask?: true;
    request?: (...args: any[]) => Promise<void>;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    autoRefreshOnNetworkChange?: boolean;
    chainId: string;
  };
  web3?: Record<string, unknown>;
}

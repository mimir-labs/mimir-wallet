// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletIcon } from '@/components';
import { walletConfig } from '@/config';
import { useWallet } from '@/wallet/useWallet';
import { useMemo } from 'react';

export function WalletSelector() {
  const { connectedWallets, openWallet, wallets } = useWallet();

  // Sort walletConfig: connected first, unconnected second, not installed last
  const sortedWalletConfig = useMemo(() => {
    return Object.entries(walletConfig).sort(([id], [id2]) => {
      const isInstalled =
        id === 'nova' ? wallets[walletConfig[id].key] && window?.walletExtension?.isNovaWallet : wallets[id];
      const isInstalled2 =
        id2 === 'nova' ? wallets[walletConfig[id2].key] && window?.walletExtension?.isNovaWallet : wallets[id2];

      const left = connectedWallets.includes(id) ? 2 : isInstalled ? 1 : isInstalled2 ? 0 : -1;
      const right = connectedWallets.includes(id2) ? 2 : isInstalled2 ? 1 : isInstalled ? 0 : -1;

      return right - left;
    });
  }, [wallets, connectedWallets]);

  return (
    <div
      className='bg-content1 border-t-secondary grid w-full cursor-pointer grid-cols-5 gap-2.5 border-t-1 pt-2.5'
      onClick={() => {
        openWallet();
      }}
    >
      {sortedWalletConfig.map(([id]) => (
        <div className='col-span-1' key={id}>
          <WalletIcon
            disabled={
              !(
                (id === 'nova'
                  ? wallets[walletConfig[id].key] && window?.walletExtension?.isNovaWallet
                  : wallets[id]) && connectedWallets.includes(id)
              )
            }
            id={id}
            key={id}
            style={{ width: 20, height: 20 }}
          />
        </div>
      ))}
    </div>
  );
}

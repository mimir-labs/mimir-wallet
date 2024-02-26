// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CONNECTED_WALLETS_KEY } from '@mimir-wallet/constants';
import { loadWallet } from '@mimir-wallet/utils';
import { useEffect, useState } from 'react';
import store from 'store';

import { documentReadyPromise } from './ctx/Wallet';
import { useApi } from './useApi';

export function useEagerConnect(): boolean {
  const { isApiReady } = useApi();
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isApiReady) {
      const connectWallets: string[] = store.get(CONNECTED_WALLETS_KEY) || [];

      const promises: Promise<void>[] = [];

      for (const wallet of connectWallets) {
        if (window.injectedWeb3?.[wallet]) {
          promises.push(loadWallet(window.injectedWeb3[wallet], 'mimir-wallet', wallet));
        } else {
          promises.push(
            documentReadyPromise().then(
              () =>
                new Promise<void>((resolve) => {
                  setTimeout(() => {
                    if (window.injectedWeb3?.[wallet]) {
                      loadWallet(window.injectedWeb3[wallet], 'mimir-wallet', wallet).finally(() => {
                        resolve();
                      });
                    } else {
                      resolve();
                    }
                  }, 1000);
                })
            )
          );
        }
      }

      Promise.all(promises).then(() => {
        setIsDone(true);
      });
    }
  }, [isApiReady]);

  return isDone;
}

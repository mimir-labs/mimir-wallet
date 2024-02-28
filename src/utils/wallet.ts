// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { store } from '@mimir-wallet/instance';
import { Injected } from '@polkadot/extension-inject/types';
import keyring from '@polkadot/ui-keyring';

export function documentReadyPromise(): Promise<void> {
  return new Promise((resolve): void => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', () => resolve());
    }
  });
}

export async function loadWallet({ enable }: { enable: (origin: string) => Promise<Injected> }, origin: string, source: string) {
  try {
    await documentReadyPromise();
    const injected = await enable(origin);
    const accounts = await injected.accounts.get(true);

    accounts.forEach(({ address, name, type }, whenCreated) => {
      const json = {
        address,
        meta: { isInjected: true, name, whenCreated, source }
      };
      const pair = keyring.keyring.addFromAddress(address, json.meta, null, type);

      keyring.accounts.add(store, pair.address, json, pair.type);
    });
  } catch (error) {
    console.error(error);
  }
}

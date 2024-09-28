// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Injected } from '@polkadot/extension-inject/types';

import { encodeAddress } from '@mimir-wallet/api';

import { sleep } from './common';

export function documentReadyPromise(): Promise<void> {
  return new Promise((resolve): void => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', () => resolve());
    }
  });
}

export async function loadWallet(
  { enable }: { enable: (origin: string) => Promise<Injected> },
  origin: string,
  source: string,
  delay = 0
) {
  if (delay) {
    await sleep(delay);
  }

  try {
    await documentReadyPromise();
    const injected = await enable(origin);
    const accounts = await injected.accounts.get(true);

    return accounts.map(({ address, name, type }) => {
      return { address: encodeAddress(address), name, type, source };
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

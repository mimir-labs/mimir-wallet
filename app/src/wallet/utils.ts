// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected } from '@polkadot/extension-inject/types';

import { encodeAddress } from '@/api';
import { sleep } from '@/utils/common';
import { documentReadyPromise } from '@/utils/document';

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

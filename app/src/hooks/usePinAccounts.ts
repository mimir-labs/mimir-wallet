// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { PINNED_ACCOUNTS_KEY } from '@/constants';

import { addressEq, addressToHex, isPolkadotAddress } from '@mimir-wallet/polkadot-core';
import { useLocalStore } from '@mimir-wallet/service';

export function usePinAccounts() {
  const [pinnedAccounts, setPinnedAccounts] = useLocalStore<HexString[]>(PINNED_ACCOUNTS_KEY, []);

  return {
    pinnedAccounts,
    setPinnedAccounts,
    addPinnedAccount: (account: string) =>
      isPolkadotAddress(account) && setPinnedAccounts([addressToHex(account), ...pinnedAccounts]),
    removePinnedAccount: (account: string) => setPinnedAccounts(pinnedAccounts.filter((a) => !addressEq(a, account)))
  };
}

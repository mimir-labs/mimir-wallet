// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { ADDRESS_BOOK_UPGRADE_VERSION_KEY } from '@/constants';

import { store } from '@mimir-wallet/service';

function upgradeAddressBookV1() {
  const addressBookVersion = store.get(ADDRESS_BOOK_UPGRADE_VERSION_KEY);

  if (Number(addressBookVersion) >= 1) {
    return;
  }

  store.each((key: string, value) => {
    if (key.startsWith('address:0x')) {
      const v = value as { address: string; meta: { name: string; watchlist?: boolean; genesisHash?: HexString } };

      store.set(key, {
        address: v.address,
        meta: { name: v.meta.name, watchlist: !!v.meta.watchlist, networks: ['polkadot', 'paseo'] }
      });
    }
  });

  store.set(ADDRESS_BOOK_UPGRADE_VERSION_KEY, '1');
}

export function upgradeAddresBook() {
  upgradeAddressBookV1();
}

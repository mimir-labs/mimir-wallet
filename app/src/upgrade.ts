// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { BatchTxItem } from './hooks/types';

import { addressToHex, allEndpoints } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { BATCH_TX_PREFIX, BATCH_TX_V2_PREFIX, HIDE_ACCOUNT_HEX_KEY, HIDE_ACCOUNT_PREFIX } from './constants';

const ADDRESS_BOOK_UPGRADE_VERSION_KEY = 'address_book_upgrade_version';
const BATCH_TX_UPGRADE_VERSION_KEY = 'batch_tx_upgrade_version';
const HIDE_ACCOUNT_HEX_UPGRADE_VERSION_KEY = 'hide_account_hex_upgrade_version';

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

function upgradeBatchTxV1() {
  const batchTxVersion = store.get(BATCH_TX_UPGRADE_VERSION_KEY);

  if (Number(batchTxVersion) >= 1) {
    return;
  }

  const nextValue: Record<string, Record<HexString, BatchTxItem[]>> = {};

  store.each((key: string, value) => {
    if (key.startsWith(BATCH_TX_PREFIX)) {
      const v = value as Record<string, BatchTxItem[]>;

      const genesisHash = key.replace(BATCH_TX_PREFIX, '');

      const network = allEndpoints.find((item) => item.genesisHash === genesisHash)?.key;

      if (!network) {
        return;
      }

      nextValue[network] = Object.entries(v).reduce<Record<HexString, BatchTxItem[]>>((acc, [address, txs]) => {
        acc[addressToHex(address)] = txs.map((tx) => ({ ...tx }));

        return acc;
      }, {});
    }
  });

  Object.entries(nextValue).forEach(([network, v]) => {
    store.set(`${BATCH_TX_V2_PREFIX}${network}`, v);
  });

  store.set(BATCH_TX_UPGRADE_VERSION_KEY, '1');
}

function upgradeHideAccountHexV1() {
  const hideAccountHexVersion = store.get(HIDE_ACCOUNT_HEX_UPGRADE_VERSION_KEY);

  if (Number(hideAccountHexVersion) >= 1) {
    return;
  }

  const nextValue: HexString[] = [];

  store.each((key: string, value) => {
    if (key.startsWith(HIDE_ACCOUNT_PREFIX)) {
      const v = value as HexString[];

      nextValue.push(...v);
    }
  });

  store.set(HIDE_ACCOUNT_HEX_KEY, Array.from(new Set<HexString>(nextValue)));

  store.set(HIDE_ACCOUNT_HEX_UPGRADE_VERSION_KEY, '1');
}

export function upgradeAddresBook() {
  upgradeAddressBookV1();
  upgradeBatchTxV1();
  upgradeHideAccountHexV1();
}

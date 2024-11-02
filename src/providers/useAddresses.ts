// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useCallback, useLayoutEffect, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { useApi } from '@mimir-wallet/hooks';
import { addressToHex, store } from '@mimir-wallet/utils';

export function _useAddresses() {
  const { genesisHash } = useApi();
  const [addresses, setAddresses] = useState<{ address: string; name: string; watchlist?: boolean }[]>([]);

  useLayoutEffect(() => {
    const getValues = () => {
      const values: { address: string; name: string; watchlist?: boolean }[] = [];

      store.each((key: string, value) => {
        if (key.startsWith('address:0x')) {
          const v = value as { address: string; meta: { name: string; watchlist?: boolean; genesisHash?: HexString } };

          if (v && v.address && v.meta?.name && (v.meta.genesisHash ? v.meta.genesisHash === genesisHash : true)) {
            values.push({
              address: encodeAddress(v.address),
              name: v.meta.name,
              watchlist: v.meta.watchlist
            });
          }
        }
      });

      return values;
    };

    setAddresses(getValues());

    store.on('store_changed', (key: string) => {
      if (key.startsWith('address:0x')) {
        setAddresses(getValues());
      }
    });
  }, [genesisHash]);

  const setName = useCallback((address: string, name: string, watchlist?: boolean) => {
    store.set(`address:${addressToHex(address)}`, { address: encodeAddress(address), meta: { name, watchlist } });
  }, []);

  const deleteAddress = useCallback((address: string) => {
    store.remove(`address:${addressToHex(address)}`);
  }, []);

  return [addresses, setName, deleteAddress] as const;
}

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useLayoutEffect, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { useApi } from '@mimir-wallet/hooks';
import { addressToHex, store } from '@mimir-wallet/utils';

export function useAddresses() {
  const { network } = useApi();
  const [addresses, setAddresses] = useState<
    { address: string; name: string; networks: string[]; watchlist?: boolean }[]
  >([]);

  useLayoutEffect(() => {
    const getValues = () => {
      const values: { address: string; name: string; watchlist?: boolean; networks: string[] }[] = [];

      store.each((key: string, value) => {
        if (key.startsWith('address:0x')) {
          const v = value as {
            address: string;
            meta: { name: string; watchlist?: boolean; networks?: string[] };
          };

          if (v && v.address && v.meta?.name && (v.meta.networks ? v.meta.networks.includes(network) : true)) {
            try {
              values.push({
                address: encodeAddress(v.address),
                name: v.meta.name,
                watchlist: v.meta.watchlist,
                networks: v.meta.networks || []
              });
            } catch {
              /* empty */
            }
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
  }, [network]);

  const setName = useCallback((address: string, name: string, networks?: string[], watchlist?: boolean) => {
    const stored = store.get(`address:${addressToHex(address)}`) as any;

    store.set(`address:${addressToHex(address)}`, {
      address: encodeAddress(address),
      meta: {
        name,
        watchlist: stored?.meta?.watchlist ?? watchlist,
        networks: Array.from(new Set([...(stored?.meta?.networks || []), ...(networks || [])]))
      }
    });
  }, []);

  const deleteAddress = useCallback((address: string) => {
    store.remove(`address:${addressToHex(address)}`);
  }, []);

  return [addresses, setName, deleteAddress] as const;
}

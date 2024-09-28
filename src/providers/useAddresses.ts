// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useLayoutEffect, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { addressToHex, store } from '@mimir-wallet/utils';

export function _useAddresses() {
  const [addresses, setAddresses] = useState<{ address: string; name: string }[]>([]);

  useLayoutEffect(() => {
    const getValues = () => {
      const values: { address: string; name: string }[] = [];

      store.each((key: string, value) => {
        if (key.startsWith('address:0x')) {
          const v = value as { address: string; meta: { name: string } };

          if (v && v.address && v.meta?.name) {
            values.push({ address: encodeAddress(v.address), name: v.meta.name });
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
  }, []);

  const setName = useCallback((address: string, name: string) => {
    store.set(`address:${addressToHex(address)}`, { address: encodeAddress(address), meta: { name } });
  }, []);

  return [addresses, setName] as const;
}

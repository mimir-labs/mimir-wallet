// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import keyring from '@polkadot/ui-keyring';
import { addressEq } from '@polkadot/util-crypto';
import { useCallback, useEffect, useState } from 'react';

import { toastError } from '@mimir-wallet/components';
import { events } from '@mimir-wallet/events';
import { AddressMeta, addressToHex, getAddressMeta, isLocalAccount, service } from '@mimir-wallet/utils';

import { createNamedHook } from './createNamedHook';

interface UseAddressMeta {
  meta: AddressMeta | undefined;
  name?: string;
  setName: React.Dispatch<string>;
  saveName: (cb?: (name: string) => void) => Promise<void>;
}

function useAddressMetaImpl(value?: string | null): UseAddressMeta {
  const [meta, setMeta] = useState<AddressMeta | undefined>(value ? getAddressMeta(value) : undefined);
  const [name, setName] = useState<string | undefined>(meta?.name);

  useEffect(() => {
    if (value) {
      const meta = getAddressMeta(value);

      setMeta(meta);
      setName(meta.name);
    }
  }, [value]);

  useEffect(() => {
    const fn = (address: string) => {
      if (value && addressEq(address, value)) {
        setMeta((meta) => {
          const newMeta = getAddressMeta(value);

          if (JSON.stringify(meta) !== JSON.stringify(newMeta)) {
            return newMeta;
          }

          return meta;
        });
      }
    };

    events.on('account_meta_changed', fn);

    return () => {
      events.off('account_meta_changed', fn);
    };
  }, [value]);

  const saveName = useCallback(
    async (cb?: (name: string) => void) => {
      if (!value || !name) return;

      if (name === meta?.name) return;

      try {
        if (isLocalAccount(value)) {
          const pair = keyring.getPair(value);

          keyring.saveAccountMeta(pair, { name });

          await service.updateAccountName(addressToHex(value), name);
          cb?.(name);
        } else {
          keyring.saveAddress(value, { name });
          cb?.(name);
        }

        events.emit('account_meta_changed', value);
      } catch (error) {
        toastError(error);
      }
    },
    [meta?.name, name, value]
  );

  return {
    meta,
    name,
    setName,
    saveName
  };
}

export const useAddressMeta = createNamedHook('useAddressMeta', useAddressMetaImpl);

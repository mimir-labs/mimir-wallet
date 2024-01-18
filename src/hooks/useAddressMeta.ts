// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { toastError } from '@mimir-wallet/components';
import { events } from '@mimir-wallet/events';
import { AddressMeta, getAddressMeta, service } from '@mimir-wallet/utils';
import keyring from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { addressEq, decodeAddress } from '@polkadot/util-crypto';
import { useCallback, useContext, useEffect, useState } from 'react';

import { KeyringCtx } from './ctx/Keyring';
import { createNamedHook } from './createNamedHook';

interface UseAddressMeta {
  meta: AddressMeta;
  name?: string;
  setName: React.Dispatch<string>;
  saveName: (cb?: (name: string) => void) => Promise<void>;
}

function useAddressMetaImpl(value?: string | null): UseAddressMeta {
  const [meta, setMeta] = useState<AddressMeta>(value ? getAddressMeta(value) : {});
  const [name, setName] = useState<string | undefined>(meta.name);
  const {
    accounts: { isAccount }
  } = useContext(KeyringCtx);

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
          } else {
            return meta;
          }
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

      if (name === meta.name) return;

      try {
        if (isAccount(value)) {
          const pair = keyring.getPair(value);

          keyring.saveAccountMeta(pair, { name });

          await service.updateAccountName(u8aToHex(decodeAddress(value)), name);
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
    [isAccount, meta.name, name, value]
  );

  return {
    meta,
    name,
    setName,
    saveName
  };
}

export const useAddressMeta = createNamedHook('useAddressMeta', useAddressMetaImpl);

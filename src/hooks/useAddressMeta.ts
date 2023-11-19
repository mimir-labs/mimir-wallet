// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import keyring from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { addressEq, decodeAddress } from '@polkadot/util-crypto';
import { useCallback, useContext, useEffect, useState } from 'react';

import { toastError } from '@mimirdev/components';
import { events } from '@mimirdev/events';
import { AddressMeta, getAddressMeta, service } from '@mimirdev/utils';

import { KeyringCtx } from './ctx/Keyring';
import { createNamedHook } from './createNamedHook';

interface UseAddressMeta {
  meta: AddressMeta;
  name?: string;
  setName: React.Dispatch<string>;
  saveName: () => void;
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

  const saveName = useCallback(() => {
    if (!value || !name) return;

    if (name === meta.name) return;

    try {
      const pair = keyring.getPair(value);

      keyring.saveAccountMeta(pair, { name });

      if (isAccount(value)) {
        service.updateAccountName(u8aToHex(decodeAddress(value)), name);
      }

      events.emit('account_meta_changed', value);
    } catch (error) {
      toastError(error);
    }
  }, [isAccount, meta.name, name, value]);

  return {
    meta,
    name,
    setName,
    saveName
  };
}

export const useAddressMeta = createNamedHook('useAddressMeta', useAddressMetaImpl);

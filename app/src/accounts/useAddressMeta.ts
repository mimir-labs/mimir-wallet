// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';

import { toastError } from '@/components/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { addressToHex, useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';

import { useAccount } from './useAccount';

interface UseAddressMeta {
  meta: AddressMeta;
  name: string;
  setName: React.Dispatch<string>;
  saveName: (isAddressBook: boolean, cb?: (name: string) => void) => Promise<void>;
}

export function useAddressMeta(value?: string | null): UseAddressMeta {
  const { network } = useApi();
  const { metas, addAddress, setAccountName } = useAccount();
  const addressHex = useMemo(() => (value ? addressToHex(value) : '0x'), [value]);
  const _meta = metas[addressHex];

  const [meta, setMeta] = useState<AddressMeta>(_meta || {});
  const [name, setName] = useState<string>(meta.name || '');

  useEffect(() => {
    if (_meta) {
      setMeta(_meta);
      setName(_meta.name || '');
    } else {
      setMeta({});
      setName('');
    }
  }, [_meta]);

  const saveName = useCallback(
    async (isAddressBook: boolean, cb?: (name: string) => void) => {
      if (!(value && name)) return;

      if (name === meta.name) return;

      try {
        if (!isAddressBook) {
          await service.updateAccountName(network, addressToHex(value), name);
          setAccountName(value, name);
          cb?.(name);
        } else {
          addAddress(value, name);
          cb?.(name);
        }
      } catch (error) {
        toastError(error);
      }
    },
    [addAddress, meta.name, name, network, setAccountName, value]
  );

  return {
    meta: meta,
    name: name,
    setName: setName,
    saveName: saveName
  };
}

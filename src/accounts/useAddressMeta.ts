// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@mimir-wallet/hooks/types';

import { useCallback, useEffect, useState } from 'react';

import { toastError } from '@mimir-wallet/components/utils';
import { addressToHex, service } from '@mimir-wallet/utils';
import { useAccountSource } from '@mimir-wallet/wallet/useWallet';

import { useAccount } from './useAccount';

interface UseAddressMeta {
  meta: AddressMeta;
  name: string;
  setName: React.Dispatch<string>;
  saveName: (cb?: (name: string) => void) => Promise<void>;
}

export function useAddressMeta(value?: string | null): UseAddressMeta {
  const { metas, addAddress, setAccountName, isLocalAccount } = useAccount();
  const source = useAccountSource(value);
  const _meta = metas[value || ''];

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
    async (cb?: (name: string) => void) => {
      if (!value || !name) return;

      if (name === meta.name) return;

      try {
        if (isLocalAccount(value) && !source) {
          await service.updateAccountName(addressToHex(value), name);
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
    [source, isLocalAccount, meta.name, name, setAccountName, addAddress, value]
  );

  return {
    meta,
    name,
    setName,
    saveName
  };
}

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from './types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { toastError } from '@mimir-wallet/components';
import { deriveAddressMeta } from '@mimir-wallet/providers';
import { addressEq, addressToHex, service } from '@mimir-wallet/utils';

import { createNamedHook } from './createNamedHook';
import { useAccount } from './useAccounts';

interface UseAddressMeta {
  meta: AddressMeta;
  name: string;
  setName: React.Dispatch<string>;
  saveName: (cb?: (name: string) => void) => Promise<void>;
}

function useAddressMetaImpl(value?: string | null): UseAddressMeta {
  const { addresses, setAddressName, setAccountName, accounts } = useAccount();
  const account = useMemo(() => accounts.find((item) => addressEq(item.address, value)), [accounts, value]);
  const address = useMemo(() => addresses.find((item) => addressEq(item.address, value)), [addresses, value]);

  const [meta, setMeta] = useState<AddressMeta>(() => deriveAddressMeta(account, address, value));
  const [name, setName] = useState<string>(meta.name);

  useEffect(() => {
    if (value) {
      const meta = deriveAddressMeta(account, address, value);

      setMeta(meta);
      setName(meta.name);
    }
  }, [account, address, value]);

  const saveName = useCallback(
    async (cb?: (name: string) => void) => {
      if (!value || !name) return;

      if (name === meta.name) return;

      try {
        if (account && !account.source) {
          await service.updateAccountName(addressToHex(value), name);
          setAccountName(value, name);
          cb?.(name);
        } else {
          setAddressName(value, name);
          cb?.(name);
        }
      } catch (error) {
        toastError(error);
      }
    },
    [account, meta.name, name, setAccountName, setAddressName, value]
  );

  return {
    meta,
    name,
    setName,
    saveName
  };
}

export const useAddressMeta = createNamedHook('useAddressMeta', useAddressMetaImpl);

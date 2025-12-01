// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';

import { addressToHex, useNetwork } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { useCallback, useMemo, useState } from 'react';

import { useAccount } from './useAccount';

import { toastError } from '@/components/utils';

interface UseAddressMeta {
  meta: AddressMeta;
  name: string;
  setName: React.Dispatch<string>;
  saveName: (isAddressBook: boolean, cb?: (name: string) => void) => Promise<void>;
}

export function useAddressMeta(value?: string | null): UseAddressMeta {
  const { network } = useNetwork();
  const { metas, addAddress, setAccountName } = useAccount();
  const addressHex = useMemo(() => (value ? addressToHex(value) : '0x'), [value]);
  const _meta = metas[addressHex];

  // Derive meta directly from _meta - no need for state
  const meta = _meta || {};

  // Name is editable state, initialized from meta.name
  const [name, setName] = useState<string>(() => _meta?.name || '');
  const [prevAddressHex, setPrevAddressHex] = useState<string>(addressHex);

  // When address changes, reset the name to the new address's name
  if (prevAddressHex !== addressHex) {
    setPrevAddressHex(addressHex);

    if (name !== (_meta?.name || '')) {
      setName(_meta?.name || '');
    }
  }

  const saveName = useCallback(
    async (isAddressBook: boolean, cb?: (name: string) => void) => {
      if (!(value && name)) return;

      if (name === meta.name) return;

      try {
        if (!isAddressBook) {
          await service.account.updateAccountName(network, addressToHex(value), name);
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

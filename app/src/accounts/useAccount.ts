// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CURRENT_ADDRESS_HEX_KEY, SWITCH_ACCOUNT_REMIND_KEY } from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';
import { isAddress } from '@polkadot/util-crypto';
import { useSearchParams } from 'react-router-dom';

import { addressToHex, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import {
  addAddressBook,
  deleteAddress,
  hideAccount,
  isLocalAccount,
  isLocalAddress,
  resync,
  setAccountName,
  setName,
  showAccount,
  updateMeta
} from './actions';

export function useAccount() {
  const { chainSS58 } = useApi();

  const {
    accounts,
    current: currentAddress,
    addresses,
    hideAccountHex,
    isMultisigSyned,
    switchAddress,
    metas
  } = useAddressStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const setCurrent = (address: string, confirm?: boolean) => {
    if (address && isAddress(address)) {
      if (confirm && !store.get(SWITCH_ACCOUNT_REMIND_KEY)) {
        useAddressStore.setState({ switchAddress: address });

        return;
      }

      const value = encodeAddress(address, chainSS58);

      useAddressStore.setState({ switchAddress: undefined });

      // update url
      const newSearchParams = new URLSearchParams(searchParams);

      newSearchParams.set('address', value);
      setSearchParams(newSearchParams);

      // update storage
      store.set(CURRENT_ADDRESS_HEX_KEY, addressToHex(value));

      useAddressStore.setState({ current: value });
    }
  };

  let current: string | undefined;

  if (currentAddress) {
    current = currentAddress;
  } else {
    const stored = store.get(CURRENT_ADDRESS_HEX_KEY) as string | undefined;

    current = stored ? encodeAddress(stored, chainSS58) : undefined;
  }

  return {
    accounts: accounts,
    addresses: addresses,
    current: current,
    hideAccountHex: hideAccountHex,
    isMultisigSyned,
    metas: metas,
    switchAddress: switchAddress,
    addAddress: setName,
    addAddressBook: addAddressBook,
    updateMeta: updateMeta,
    deleteAddress: deleteAddress,
    hideAccount: hideAccount,
    isLocalAccount: isLocalAccount,
    isLocalAddress: isLocalAddress,
    resync: resync,
    setAccountName: setAccountName,
    setCurrent: setCurrent,
    showAccount: showAccount
  };
}

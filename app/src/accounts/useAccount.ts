// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CURRENT_ADDRESS_PREFIX, SWITCH_ACCOUNT_REMIND_KEY } from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';
import { isAddress } from '@polkadot/util-crypto';
import { useSearchParams } from 'react-router-dom';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import {
  addAddressBook,
  appendMeta,
  deleteAddress,
  hideAccount,
  isLocalAccount,
  isLocalAddress,
  resync,
  setAccountName,
  setName,
  showAccount
} from './actions';

export function useAccount() {
  const { chain } = useApi();

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

      const value = encodeAddress(address);

      useAddressStore.setState({ switchAddress: undefined });

      // update url
      const newSearchParams = new URLSearchParams(searchParams);

      newSearchParams.set('address', value);
      setSearchParams(newSearchParams);

      // update storage
      store.set(`${CURRENT_ADDRESS_PREFIX}${chain.key}`, value);

      useAddressStore.setState({ current: value });
    }
  };

  let current: string | undefined;

  if (currentAddress) {
    current = currentAddress;
  } else {
    current = store.get(`${CURRENT_ADDRESS_PREFIX}${chain.key}`) as string | undefined;
  }

  return {
    accounts,
    addresses,
    current,
    hideAccountHex,
    isMultisigSyned,
    metas,
    switchAddress,
    addAddress: setName,
    addAddressBook: addAddressBook,
    appendMeta: appendMeta,
    deleteAddress: deleteAddress,
    hideAccount: hideAccount,
    isLocalAccount: isLocalAccount,
    isLocalAddress: isLocalAddress,
    resync: resync,
    setAccountName,
    setCurrent,
    showAccount: showAccount
  };
}

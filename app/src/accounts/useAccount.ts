// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWITCH_ACCOUNT_REMIND_KEY } from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';
import { isAddress } from '@polkadot/util-crypto';
import { useCallback, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import { addressEq, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { addAddressBook, deleteAddress, hideAccount, resync, setAccountName, setName, showAccount } from './actions';
import { AccountContext } from './context';

export function useAccount() {
  const { chainSS58 } = useApi();
  const { metas, updateMetas } = useContext(AccountContext);

  const { accounts, current, addresses, hideAccountHex, isMultisigSyned, switchAddress } = useAddressStore();
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

      useAddressStore.setState({ current: value });
    }
  };

  const isLocalAddress = useCallback(
    (address: string, watchlist?: boolean) => {
      return addresses.some((item) => (watchlist ? !!item.watchlist : true) && addressEq(item.address, address));
    },
    [addresses]
  );

  const isLocalAccount = useCallback(
    (address: string) => {
      return accounts.some((item) => addressEq(item.address, address));
    },
    [accounts]
  );

  // let current: string | undefined;

  // if (currentAddress) {
  //   current = currentAddress;
  // } else {
  //   const stored = store.get(CURRENT_ADDRESS_HEX_KEY) as string | undefined;

  //   current = stored ? encodeAddress(stored, chainSS58) : undefined;
  // }

  return {
    accounts: accounts,
    addresses: addresses,
    current: current,
    hideAccountHex: hideAccountHex,
    isMultisigSyned,
    switchAddress: switchAddress,
    addAddress: setName,
    addAddressBook: addAddressBook,
    deleteAddress: deleteAddress,
    hideAccount: hideAccount,
    isLocalAccount: isLocalAccount,
    isLocalAddress: isLocalAddress,
    resync: resync,
    setAccountName: setAccountName,
    setCurrent: setCurrent,
    showAccount: showAccount,
    // context
    metas: metas,
    updateMetas: updateMetas
  };
}

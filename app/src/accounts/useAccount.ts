// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';

import { SWITCH_ACCOUNT_REMIND_KEY } from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';
import { merge } from 'lodash-es';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { addressEq, encodeAddress, isPolkadotAddress, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { addAddressBook, deleteAddress, hideAccount, resync, setAccountName, setName, showAccount } from './actions';
import { AccountContext } from './context';

export const AddressMetaContext = createContext<Record<`0x${string}`, AddressMeta>>({});

export function useAccount() {
  const { chainSS58 } = useApi();
  const { metas, updateMetas } = useContext(AccountContext);
  const overrideMetas = useContext(AddressMetaContext);

  const finalMetas = useMemo(() => {
    if (!overrideMetas || Object.keys(overrideMetas).length === 0) {
      return metas;
    }

    // Deep merge metas with overrideMetas, where overrideMetas takes precedence
    return merge({}, metas, overrideMetas);
  }, [metas, overrideMetas]);

  const { accounts, current, addresses, hideAccountHex, isMultisigSyned, switchAddress } = useAddressStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const setCurrent = (address: string, confirm?: boolean) => {
    if (address && isPolkadotAddress(address)) {
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
    metas: finalMetas,
    updateMetas: updateMetas
  };
}

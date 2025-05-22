// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { HIDE_ACCOUNT_HEX_KEY } from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';
import { useWallet } from '@/wallet/useWallet';
import { u8aToHex } from '@polkadot/util';
import { isEqual } from 'lodash-es';

import { addressEq, addressToHex, decodeAddress } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { sync } from './sync';

export async function resync(isOmni: boolean, network: string, chainSS58: number) {
  const { walletAccounts } = useWallet.getState();

  await sync(
    isOmni,
    network,
    chainSS58,
    walletAccounts.map((item) => item.address),
    (values) => {
      useAddressStore.setState((state) => ({
        accounts: isEqual(values, state.accounts) ? state.accounts : values,
        isMultisigSyned: true
      }));
    }
  );
}

export function showAccount(address: string) {
  const { hideAccountHex } = useAddressStore.getState();
  const addressHex = u8aToHex(decodeAddress(address));

  const filteredHex = hideAccountHex.filter((item) => item !== addressHex);

  store.set(HIDE_ACCOUNT_HEX_KEY, filteredHex);

  useAddressStore.setState({
    hideAccountHex: filteredHex
  });
}

export function hideAccount(address: string) {
  const { hideAccountHex } = useAddressStore.getState();
  const addressHex = u8aToHex(decodeAddress(address));

  const newHideAccountHex = Array.from(new Set<HexString>([...hideAccountHex, addressHex]));

  store.set(HIDE_ACCOUNT_HEX_KEY, newHideAccountHex);

  useAddressStore.setState({
    hideAccountHex: newHideAccountHex
  });
}

export function setAccountName(address: string, name: string) {
  useAddressStore.setState((state) => {
    return {
      ...state,
      accounts: state.accounts.map((item) => (addressEq(item.address, address) ? { ...item, name } : item))
    };
  });
}

export function setName(address: string, name: string, watchlist?: boolean) {
  const stored = store.get(`address:${addressToHex(address)}`) as any;

  store.set(`address:${addressToHex(address)}`, {
    address: address,
    meta: {
      name,
      watchlist: stored?.meta?.watchlist ?? watchlist
    }
  });
}

export function deleteAddress(address: string) {
  store.remove(`address:${addressToHex(address)}`);
}

export function addAddressBook(
  address?: string,
  watchlist?: boolean,
  onAdded?: (address: string) => void,
  onClose?: () => void
) {
  if (address && addressEq(address, '0x0000000000000000000000000000000000000000000000000000000000000000')) {
    return;
  }

  useAddressStore.setState({
    addAddressDialog: {
      defaultAddress: address,
      watchlist,
      open: true,
      onAdded,
      onClose
    }
  });
}

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { HIDE_ACCOUNT_PREFIX } from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';
import { useWallet } from '@/wallet/useWallet';
import { u8aToHex } from '@polkadot/util';
import { isEqual } from 'lodash-es';

import { addressEq, addressToHex, decodeAddress } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { sync } from './sync';
import { deriveAccountMeta } from './utils';

export async function resync(chainSS58: number) {
  const { walletAccounts } = useWallet.getState();

  await sync(chainSS58, walletAccounts, (values) => {
    useAddressStore.setState((state) => ({
      accounts: isEqual(values, state.accounts) ? state.accounts : values,
      isMultisigSyned: true
    }));
  });
}

export function isLocalAccount(address: string) {
  const { accounts } = useAddressStore.getState();

  return accounts.some((item) => addressEq(item.address, address));
}

export function isLocalAddress(address: string, watchlist?: boolean) {
  const { addresses } = useAddressStore.getState();

  return addresses.some((item) => (watchlist ? !!item.watchlist : true) && addressEq(item.address, address));
}

export function updateMeta(account: AccountData) {
  useAddressStore.setState((state) => {
    const newMetas = { ...state.metas };

    deriveAccountMeta(account, newMetas);

    return {
      metas: newMetas
    };
  });
}

export function showAccount(chain: string, address: string) {
  const { hideAccountHex } = useAddressStore.getState();
  const addressHex = u8aToHex(decodeAddress(address));

  const filteredHex = hideAccountHex.filter((item) => item !== addressHex);

  store.set(`${HIDE_ACCOUNT_PREFIX}${chain}`, filteredHex);

  useAddressStore.setState({
    hideAccountHex: filteredHex
  });
}

export function hideAccount(chain: string, address: string) {
  const { hideAccountHex } = useAddressStore.getState();
  const addressHex = u8aToHex(decodeAddress(address));

  const newHideAccountHex = Array.from(new Set<HexString>([...hideAccountHex, addressHex]));

  store.set(`${HIDE_ACCOUNT_PREFIX}${chain}`, newHideAccountHex);

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

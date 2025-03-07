// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { decodeAddress, encodeAddress } from '@/api';
import { HIDE_ACCOUNT_PREFIX } from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';
import { useApi } from '@/hooks/useApi';
import { addressEq, addressToHex, store } from '@/utils';
import { useWallet } from '@/wallet/useWallet';
import { u8aToHex } from '@polkadot/util';
import { isEqual } from 'lodash-es';

import { sync } from './sync';

export async function resync() {
  const { genesisHash } = useApi.getState();
  const { walletAccounts } = useWallet.getState();

  await sync(genesisHash, walletAccounts, (values) => {
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

export function appendMeta(meta: Record<string, AddressMeta>) {
  useAddressStore.setState((state) => ({
    metas: Object.entries(meta).reduce(
      (result, item) => {
        result[item[0]] = { ...result[item[0]], ...item[1] };

        return result;
      },
      { ...state.metas }
    )
  }));
}

export function showAccount(address: string) {
  const { hideAccountHex } = useAddressStore.getState();
  const { chain } = useApi.getState();
  const addressHex = u8aToHex(decodeAddress(address));

  const filteredHex = hideAccountHex.filter((item) => item !== addressHex);

  store.set(`${HIDE_ACCOUNT_PREFIX}${chain.key}`, filteredHex);

  useAddressStore.setState({
    hideAccountHex: filteredHex
  });
}

export function hideAccount(address: string) {
  const { hideAccountHex } = useAddressStore.getState();
  const { chain } = useApi.getState();
  const addressHex = u8aToHex(decodeAddress(address));

  const newHideAccountHex = Array.from(new Set<HexString>([...hideAccountHex, addressHex]));

  store.set(`${HIDE_ACCOUNT_PREFIX}${chain.key}`, newHideAccountHex);

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

export function setName(address: string, name: string, networks?: string[], watchlist?: boolean) {
  const stored = store.get(`address:${addressToHex(address)}`) as any;

  store.set(`address:${addressToHex(address)}`, {
    address: encodeAddress(address),
    meta: {
      name,
      watchlist: stored?.meta?.watchlist ?? watchlist,
      networks: Array.from(new Set([...(stored?.meta?.networks || []), ...(networks || [])]))
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

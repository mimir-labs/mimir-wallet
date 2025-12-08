// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import {
  addressEq,
  addressToHex,
  decodeAddress,
} from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';
import { u8aToHex } from '@polkadot/util';
import { isEqual } from 'lodash-es';

import { sync } from './sync';

import { HIDE_ACCOUNT_HEX_KEY } from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';
import { useWallet } from '@/wallet/useWallet';

// Overload signatures
export async function resync(isOmni: true, chainSS58: number): Promise<void>;
export async function resync(
  isOmni: false,
  network: string,
  chainSS58: number,
): Promise<void>;

// Implementation
export async function resync(
  isOmni: boolean,
  networkOrChainSS58: string | number,
  chainSS58?: number,
): Promise<void> {
  const { walletAccounts } = useWallet.getState();
  const addresses = walletAccounts.map((item) => item.address);

  const callback = (values: AccountData[]) => {
    useAddressStore.setState((state) => ({
      accounts: isEqual(values, state.accounts) ? state.accounts : values,
      isMultisigSyned: true,
    }));
  };

  if (isOmni) {
    await sync(true, networkOrChainSS58 as number, addresses, callback);
  } else {
    await sync(
      false,
      networkOrChainSS58 as string,
      chainSS58!,
      addresses,
      callback,
    );
  }
}

export function showAccount(address: string) {
  const { hideAccountHex } = useAddressStore.getState();
  const addressHex = u8aToHex(decodeAddress(address));

  const filteredHex = hideAccountHex.filter((item) => item !== addressHex);

  store.set(HIDE_ACCOUNT_HEX_KEY, filteredHex);

  useAddressStore.setState({
    hideAccountHex: filteredHex,
  });
}

export function hideAccount(address: string) {
  const { hideAccountHex } = useAddressStore.getState();
  const addressHex = u8aToHex(decodeAddress(address));

  const newHideAccountHex = Array.from(
    new Set<HexString>([...hideAccountHex, addressHex]),
  );

  store.set(HIDE_ACCOUNT_HEX_KEY, newHideAccountHex);

  useAddressStore.setState({
    hideAccountHex: newHideAccountHex,
  });
}

export function setAccountName(address: string, name: string) {
  useAddressStore.setState((state) => {
    return {
      ...state,
      accounts: state.accounts.map((item) =>
        addressEq(item.address, address) ? { ...item, name } : item,
      ),
    };
  });
}

export function setName(address: string, name: string, watchlist?: boolean) {
  const stored = store.get(`address:${addressToHex(address)}`) as any;

  store.set(`address:${addressToHex(address)}`, {
    address: address,
    meta: {
      name,
      watchlist: stored?.meta?.watchlist ?? watchlist,
    },
  });
}

export function deleteAddress(address: string) {
  store.remove(`address:${addressToHex(address)}`);
}

export function addAddressBook(
  address?: string,
  watchlist?: boolean,
  onAdded?: (address: string) => void,
  onClose?: () => void,
) {
  if (
    address &&
    addressEq(
      address,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
  ) {
    return;
  }

  useAddressStore.setState({
    addAddressDialog: {
      defaultAddress: address,
      watchlist,
      open: true,
      onAdded,
      onClose,
    },
  });
}

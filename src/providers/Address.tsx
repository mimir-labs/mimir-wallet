// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { Endpoint } from '@mimir-wallet/config';
import type { AddressMeta } from '@mimir-wallet/hooks/types';
import type { AddressState } from './types';

import { u8aToHex } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ApiCtx, decodeAddress, encodeAddress } from '@mimir-wallet/api';
import { AddAddressDialog } from '@mimir-wallet/components';
import { CURRENT_ADDRESS_PREFIX, HIDE_ACCOUNT_PREFIX, SWITCH_ACCOUNT_REMIND_KEY } from '@mimir-wallet/constants';
import { useLocalStore } from '@mimir-wallet/hooks';
import { addressEq, store } from '@mimir-wallet/utils';

import { AddressCtx, WalletCtx } from './context';
import { sync } from './sync';
import { useAddresses } from './useAddresses';
import { deriveAddressMeta } from './utils';

interface Props {
  address?: string;
  chain: Endpoint;
  children?: React.ReactNode;
}
const EMPTY_STATE = {
  accounts: [],
  addresses: [],
  isMultisigSyned: false
} as unknown as AddressState;

export function AddressCtxRoot({ address, chain, children }: Props): React.ReactElement<Props> {
  const [state, setState] = useState<AddressState>({
    ...EMPTY_STATE
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [switchAddress, setSwitchAddress] = useState<string>();
  const { genesisHash } = useContext(ApiCtx);
  const { isWalletReady, walletAccounts } = useContext(WalletCtx);
  const [addresses, addAddress, deleteAddress] = useAddresses();
  const [metas, setMetas] = useState<Record<string, AddressMeta>>({});
  const [addAddressDialog, setAddAddressDialog] = useState<{
    defaultAddress?: string;
    watchlist?: boolean;
    open: boolean;
    onAdded?: (address: string) => void;
    onClose?: () => void;
  }>({ open: false });
  const [hideAccountHex, setHideAccountHex] = useLocalStore<HexString[]>(`${HIDE_ACCOUNT_PREFIX}${chain.key}`, []);

  const currentRef = useRef<string | undefined>(address ? encodeAddress(address) : undefined);

  const urlAddress = searchParams.get('address');

  currentRef.current = urlAddress && isAddress(urlAddress) ? encodeAddress(urlAddress) : currentRef.current;

  useEffect(() => {
    setMetas(deriveAddressMeta(state.accounts, addresses));
  }, [state.accounts, addresses]);

  useEffect(() => {
    let interval: any;

    if (isWalletReady) {
      sync(genesisHash, walletAccounts, setState);

      interval = setInterval(() => {
        sync(genesisHash, walletAccounts, setState);
      }, 6000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [genesisHash, isWalletReady, walletAccounts]);

  const resync = useCallback(async () => {
    await sync(genesisHash, walletAccounts, setState);
  }, [genesisHash, walletAccounts]);

  const isLocalAccount = useCallback(
    (address: string) => state.accounts.findIndex((item) => addressEq(item.address, address)) > -1,
    [state.accounts]
  );
  const isLocalAddress = useCallback(
    (address: string, watchlist?: boolean) =>
      addresses.findIndex((item) => (watchlist ? !!item.watchlist : true) && addressEq(item.address, address)) > -1,
    [addresses]
  );
  const _setCurrent = useCallback(
    (address: string, confirm?: boolean) => {
      if (address && isAddress(address)) {
        if (confirm && !store.get(SWITCH_ACCOUNT_REMIND_KEY)) {
          setSwitchAddress(address);

          return;
        }

        const value = encodeAddress(address);

        setSwitchAddress(undefined);
        currentRef.current = value;

        // update url
        const newSearchParams = new URLSearchParams(searchParams);

        newSearchParams.set('address', value);

        // update storage
        setSearchParams(newSearchParams);
        store.set(`${CURRENT_ADDRESS_PREFIX}${chain.key}`, value);
      }
    },
    [chain.key, searchParams, setSearchParams]
  );

  const appendMeta = useCallback((meta: Record<string, AddressMeta>) => {
    setMetas((metas) => {
      return Object.entries(meta).reduce(
        (result, item) => {
          result[item[0]] = { ...result[item[0]], ...item[1] };

          return result;
        },
        { ...metas }
      );
    });
  }, []);

  const addAddressBook = useCallback(
    (address?: string, watchlist?: boolean, onAdded?: (address: string) => void, onClose?: () => void) => {
      setAddAddressDialog({
        defaultAddress: address,
        watchlist,
        open: true,
        onAdded,
        onClose
      });
    },
    []
  );

  const showAccount = useCallback(
    (address: string) => {
      const addressHex = u8aToHex(decodeAddress(address));

      setHideAccountHex((value) => value.filter((item) => item !== addressHex));
    },
    [setHideAccountHex]
  );

  const hideAccount = useCallback(
    (address: string) => {
      const addressHex = u8aToHex(decodeAddress(address));

      setHideAccountHex((value) => Array.from(new Set([...value, addressHex])));
    },
    [setHideAccountHex]
  );

  const value = {
    ...state,
    hideAccountHex,
    current: currentRef.current,
    metas,
    addresses,
    switchAddress,
    resync,
    appendMeta,
    setCurrent: _setCurrent,
    setAccountName: (address: string, name: string) =>
      setState((state) => {
        return {
          ...state,
          accounts: state.accounts.map((item) => (addressEq(item.address, address) ? { ...item, name } : item))
        };
      }),
    addAddress,
    addAddressBook,
    deleteAddress,
    isLocalAccount,
    isLocalAddress,
    showAccount,
    hideAccount
  };

  return (
    <AddressCtx.Provider value={value}>
      {children}
      <AddAddressDialog
        defaultAddress={addAddressDialog.defaultAddress}
        open={addAddressDialog.open}
        onClose={() => {
          addAddressDialog?.onClose?.();
          setAddAddressDialog((state) => ({ ...state, open: false }));
        }}
        watchlist={addAddressDialog.watchlist}
        onAdded={addAddressDialog.onAdded}
      />
    </AddressCtx.Provider>
  );
}

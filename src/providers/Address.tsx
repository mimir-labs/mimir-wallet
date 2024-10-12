// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@mimir-wallet/hooks/types';
import type { AddressState } from './types';

import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ApiCtx, encodeAddress } from '@mimir-wallet/api';
import { SWITCH_ACCOUNT_REMIND_KEY } from '@mimir-wallet/constants';
import { useQueryParam } from '@mimir-wallet/hooks';
import { addressEq, store } from '@mimir-wallet/utils';

import { sync } from './sync';
import { _useAddresses } from './useAddresses';
import { deriveAddressMeta } from './utils';
import { WalletCtx } from './Wallet';

interface Props {
  children?: React.ReactNode;
}
const EMPTY_STATE = {
  accounts: [],
  addresses: [],
  isMultisigSyned: false
} as unknown as AddressState;

export const AddressCtx = React.createContext<AddressState>({} as AddressState);

export function AddressCtxRoot({ children }: Props): React.ReactElement<Props> {
  const [state, setState] = useState<AddressState>({
    ...EMPTY_STATE
  });
  const [current, setCurrent] = useQueryParam<string | undefined>('address');
  const currentRef = useRef(current);
  const [switchAddress, setSwitchAddress] = useState<string>();
  const { genesisHash } = useContext(ApiCtx);
  const { isWalletReady, walletAccounts } = useContext(WalletCtx);
  const [addresses, setAddressName] = _useAddresses();
  const [metas, setMetas] = useState<Record<string, AddressMeta>>({});

  if (current) {
    currentRef.current = current;
  }

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
    (address: string) => addresses.findIndex((item) => addressEq(item.address, address)) > -1,
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
        setCurrent(value);
      }
    },
    [setCurrent]
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

  const value = useMemo(
    () => ({
      ...state,
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
      setAddressName,
      isLocalAccount,
      isLocalAddress
    }),
    [
      state,
      metas,
      addresses,
      switchAddress,
      resync,
      appendMeta,
      _setCurrent,
      setAddressName,
      isLocalAccount,
      isLocalAddress
    ]
  );

  return <AddressCtx.Provider value={value}>{children}</AddressCtx.Provider>;
}

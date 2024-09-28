// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressState } from './types';

import { isAddress } from '@polkadot/util-crypto';
import { isEqual } from 'lodash-es';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiCtx, encodeAddress } from '@mimir-wallet/api';
import { CURRENT_ADDRESS_PREFIX } from '@mimir-wallet/constants';
import { addressEq, service, store } from '@mimir-wallet/utils';

import { extraAccounts, sync } from './sync';
import { _useAddresses } from './useAddresses';
import { _setAllAccounts, _setAllAddresses } from './utils';
import { WalletCtx } from './Wallet';

interface Props {
  address?: string;
  children?: React.ReactNode;
}
const EMPTY_STATE = {
  accounts: [],
  addresses: [],
  isMultisigSyned: false
} as unknown as AddressState;

export const AddressCtx = React.createContext<AddressState>({} as AddressState);

export function AddressCtxRoot({ children, address }: Props): React.ReactElement<Props> {
  const [state, setState] = useState<AddressState>({
    ...EMPTY_STATE,
    current: address ? encodeAddress(address) : undefined
  });
  const { genesisHash, network } = useContext(ApiCtx);
  const { isWalletReady, walletAccounts } = useContext(WalletCtx);
  const [addresses, setAddressName] = _useAddresses();

  _setAllAccounts(state.accounts);
  _setAllAddresses(addresses);

  useEffect(() => {
    if (isWalletReady) {
      sync(genesisHash, walletAccounts, setState);
    }
  }, [genesisHash, isWalletReady, walletAccounts]);

  const resync = useCallback(async () => {
    const data = await service.getMultisigs(walletAccounts.map((item) => item.address));
    const accounts = extraAccounts(genesisHash, walletAccounts, data);

    setState((state) => ({
      ...state,
      accounts: isEqual(state.accounts, accounts) ? state.accounts : accounts
    }));
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
    (address: string) => {
      if (address && isAddress(address)) {
        store.set(`${CURRENT_ADDRESS_PREFIX}${network}`, address);
        setState((state) => ({ ...state, current: encodeAddress(address) }));
      }
    },
    [network]
  );

  const value = useMemo(
    () => ({
      ...state,
      addresses,
      resync,
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
    [state, addresses, resync, _setCurrent, setAddressName, isLocalAccount, isLocalAddress]
  );

  return <AddressCtx.Provider value={value}>{children}</AddressCtx.Provider>;
}

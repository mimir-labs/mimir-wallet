// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '@mimir-wallet/config';
import type { AddressMeta } from '@mimir-wallet/hooks/types';
import type { AddressState } from './types';

import { isAddress } from '@polkadot/util-crypto';
import { isEqual } from 'lodash-es';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiCtx, encodeAddress } from '@mimir-wallet/api';
import { CURRENT_ADDRESS_PREFIX } from '@mimir-wallet/constants';
import { useLocalStore } from '@mimir-wallet/hooks';
import { addressEq, service } from '@mimir-wallet/utils';

import { extraAccounts, sync } from './sync';
import { _useAddresses } from './useAddresses';
import { deriveAddressMeta } from './utils';
import { WalletCtx } from './Wallet';

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

export const AddressCtx = React.createContext<AddressState>({} as AddressState);

export function AddressCtxRoot({ children, chain, address }: Props): React.ReactElement<Props> {
  const [state, setState] = useState<AddressState>({
    ...EMPTY_STATE
  });
  const [current, setCurrent] = useLocalStore<string | undefined>(
    `${CURRENT_ADDRESS_PREFIX}${chain.key}`,
    address ? encodeAddress(address) : undefined
  );
  const { genesisHash } = useContext(ApiCtx);
  const { isWalletReady, walletAccounts } = useContext(WalletCtx);
  const [addresses, setAddressName] = _useAddresses();
  const [metas, setMetas] = useState<Record<string, AddressMeta>>({});

  useEffect(() => {
    setMetas(deriveAddressMeta(state.accounts, state.addresses));
  }, [state.accounts, state.addresses]);

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
        setCurrent(encodeAddress(address));
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
      current,
      metas,
      addresses,
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
    [state, current, metas, addresses, resync, appendMeta, _setCurrent, setAddressName, isLocalAccount, isLocalAddress]
  );

  return <AddressCtx.Provider value={value}>{children}</AddressCtx.Provider>;
}

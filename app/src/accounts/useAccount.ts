// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';

import {
  addressEq,
  addressToHex,
  encodeAddress,
  isPolkadotAddress,
  useChains,
  useNetwork,
  useSs58Format,
} from '@mimir-wallet/polkadot-core';
import { service, store, useQueryClient } from '@mimir-wallet/service';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { merge } from 'lodash-es';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import {
  addAddressBook,
  deleteAddress,
  hideAccount,
  resync,
  setAccountName,
  setName,
  showAccount,
} from './actions';
import { AccountContext } from './context';

import {
  CURRENT_ADDRESS_HEX_KEY,
  CURRENT_ADDRESS_PREFIX,
  SWITCH_ACCOUNT_REMIND_KEY,
} from '@/constants';
import { useAddressStore } from '@/hooks/useAddressStore';

export const AddressMetaContext = createContext<
  Record<`0x${string}`, AddressMeta>
>({});

export function useAccount() {
  const { ss58: chainSS58 } = useSs58Format();
  const { network } = useNetwork();
  const { mode, enableNetwork } = useChains();
  const { metas, updateMetas } = useContext(AccountContext);
  const overrideMetas = useContext(AddressMetaContext);

  const finalMetas = useMemo(() => {
    if (!overrideMetas || Object.keys(overrideMetas).length === 0) {
      return metas;
    }

    // Deep merge metas with overrideMetas, where overrideMetas takes precedence
    return merge({}, metas, overrideMetas);
  }, [metas, overrideMetas]);

  const {
    accounts,
    addresses,
    hideAccountHex,
    isMultisigSyned,
    switchAddress,
  } = useAddressStore();
  const navigate = useNavigate();

  // Get current address from URL search params
  const { address: urlAddress } = useSearch({ strict: false });
  const current = urlAddress as string | undefined;

  const queryClient = useQueryClient();

  const setCurrent = (address: string, confirm?: boolean) => {
    if (address && isPolkadotAddress(address)) {
      if (confirm && !store.get(SWITCH_ACCOUNT_REMIND_KEY)) {
        useAddressStore.setState({ switchAddress: address });

        return;
      }

      const value = encodeAddress(address, chainSS58);

      useAddressStore.setState({ switchAddress: undefined });

      // Persist to localStorage
      if (mode === 'omni') {
        store.set(CURRENT_ADDRESS_HEX_KEY, addressToHex(value));
      } else {
        store.set(`${CURRENT_ADDRESS_PREFIX}${network}`, addressToHex(value));
      }

      // Update URL - this is now the single source of truth for current address
      navigate({
        to: '.',
        search: (prev) => ({ ...prev, address: value }),
      });
    }
  };

  useEffect(() => {
    if (current) {
      const addressHex = addressToHex(current);

      queryClient
        .ensureQueryData({
          queryKey: ['omni-chain-account', addressHex] as const,
          queryFn: () => service.account.getOmniChainDetails(addressHex),
        })
        .then((data) => {
          if (data.type === 'pure') {
            enableNetwork(data.network);
          }
        });
    }
  }, [current, enableNetwork, queryClient]);

  const isLocalAddress = useCallback(
    (address: string, watchlist?: boolean) => {
      return addresses.some(
        (item) =>
          (watchlist ? !!item.watchlist : true) &&
          addressEq(item.address, address),
      );
    },
    [addresses],
  );

  const isLocalAccount = useCallback(
    (address: string) => {
      return accounts.some((item) => addressEq(item.address, address));
    },
    [accounts],
  );

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
    updateMetas: updateMetas,
  };
}

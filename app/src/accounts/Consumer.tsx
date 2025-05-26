// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AddressMeta } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { CURRENT_ADDRESS_HEX_KEY, CURRENT_ADDRESS_PREFIX } from '@/constants';
import { type AddressState, useAddressStore } from '@/hooks/useAddressStore';
import { useWallet } from '@/wallet/useWallet';
import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { addressEq, addressToHex, encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { AccountContext } from './context';
import { sync } from './sync';
import { deriveAccountMeta } from './utils';

/**
 * AddressConsumer component
 * Manages address book synchronization and account state updates
 * This component doesn't render anything but handles important background tasks
 */
function AddressConsumer({ children }: { children: React.ReactNode }) {
  const { chainSS58, network, genesisHash } = useApi();
  const { mode } = useNetworks();
  const { isWalletReady, walletAccounts } = useWallet();
  const { accounts, addresses } = useAddressStore();
  const [metas, setMetas] = useState<Record<HexString, AddressMeta>>({});

  const updateMetas = useCallback((account: AccountData) => {
    setMetas((prevMetas) => {
      const newMetas = { ...prevMetas };

      deriveAccountMeta(account, newMetas);

      return newMetas;
    });
  }, []);

  useEffect(() => {
    setMetas((prevMetas) => {
      const metas: Record<HexString, AddressMeta> = { ...prevMetas };

      for (const account of accounts) {
        deriveAccountMeta(account, metas);
      }

      // add injected accounts to metas
      for (const account of walletAccounts) {
        const addressHex = addressToHex(account.address);

        metas[addressHex] = {
          ...metas[addressHex],
          isInjected: true,
          source: account.source,
          cryptoType: account.type || 'ed25519',
          name: account.name || metas[addressHex].name || ''
        } as AddressMeta;
      }

      return metas;
    });
  }, [accounts, walletAccounts]);
  // add addresses book to metas
  const finalMetas = useMemo(() => {
    const newMetas = { ...metas };

    for (const { name, address } of addresses) {
      const addressHex = addressToHex(address);

      newMetas[addressHex] = {
        ...newMetas[addressHex],
        name
      };
    }

    return newMetas;
  }, [addresses, metas]);

  useEffect(() => {
    const onChange = (state: AddressState, prevState: AddressState) => {
      if (state.current && state.current !== prevState.current) {
        mode === 'omni'
          ? store.set(CURRENT_ADDRESS_HEX_KEY, addressToHex(state.current))
          : store.set(`${CURRENT_ADDRESS_PREFIX}${network}`, state.current);
      }
    };

    const unsubscribe = useAddressStore.subscribe(onChange);

    return unsubscribe;
  }, [mode, network]);

  // Initialize address book from local storage
  // This effect runs once when the network changes to load stored addresses
  useEffect(() => {
    // Helper function to get stored address values
    const getValues = () => {
      const values: { address: string; name: string; watchlist?: boolean }[] = [];

      store.each((key: string, value) => {
        if (key.startsWith('address:0x')) {
          const v = value as {
            address: string;
            meta: { name: string; watchlist?: boolean };
          };

          if (v?.address && v.meta?.name) {
            try {
              values.push({
                address: encodeAddress(v.address, chainSS58),
                name: v.meta.name,
                watchlist: v.meta.watchlist
              });
            } catch {
              /* empty */
            }
          }
        }
      });

      return values;
    };

    // Update address store with initial values
    useAddressStore.setState({
      addresses: getValues()
    });

    // Listen for changes in stored addresses
    store.on('store_changed', (key: string) => {
      if (key.startsWith('address:0x')) {
        useAddressStore.setState({
          addresses: getValues()
        });
      }
    });
  }, [chainSS58]);

  const sortedWalletAccounts = useMemo(
    () =>
      walletAccounts
        .map((item) => addressToHex(item.address))
        .sort()
        .join(','),
    [walletAccounts]
  );

  const [syncData, setSyncData] = useState<AccountData[]>([]);

  // Sync multisig accounts periodically
  // This effect handles initial sync and periodic updates of multisig account data
  useEffect(() => {
    let interval: any;

    const update = (value: AccountData[]) =>
      setSyncData((prevValue) => (isEqual(value, prevValue) ? prevValue : value));

    if (isWalletReady && sortedWalletAccounts) {
      // Initial sync when wallet is ready
      sync(mode === 'omni', network, chainSS58, sortedWalletAccounts.split(','), update);

      // Set up periodic sync every 6 seconds
      interval = setInterval(() => {
        sync(mode === 'omni', network, chainSS58, sortedWalletAccounts.split(','), update);
      }, 12000);
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(interval);
    };
  }, [chainSS58, isWalletReady, mode, network, sortedWalletAccounts]);

  useEffect(() => {
    const updateAccounts = (values: AccountData[]) => {
      useAddressStore.setState((state) => {
        const newWalletAccounts = walletAccounts
          .filter((account) => !values.some((a) => addressEq(a.address, account.address)))
          .map(
            (account): AccountData => ({
              createdAt: Date.now(),
              address: encodeAddress(account.address, chainSS58),
              name: account.name,
              delegatees: [],
              type: 'account'
            })
          );
        const newValues =
          mode === 'solo'
            ? values.filter((account) => (account.type === 'pure' ? account.network === genesisHash : true))
            : values;
        const newAccounts = [...newValues, ...newWalletAccounts];

        return {
          accounts: isEqual(newAccounts, state.accounts) ? state.accounts : newAccounts,
          isMultisigSyned: true
        };
      });
    };

    updateAccounts(syncData);
  }, [chainSS58, genesisHash, mode, syncData, walletAccounts]);

  // Component doesn't render anything visible
  return <AccountContext.Provider value={{ metas: finalMetas, updateMetas }}>{children}</AccountContext.Provider>;
}

export default AddressConsumer;

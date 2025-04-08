// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AddressMeta } from '@/hooks/types';

import { useAddressStore } from '@/hooks/useAddressStore';
import { useWallet } from '@/wallet/useWallet';
import { isEqual } from 'lodash-es';
import { useEffect, useLayoutEffect } from 'react';

import { addressEq, addressToHex, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';

import { sync } from './sync';
import { useAccount } from './useAccount';
import { deriveAccountMeta } from './utils';

/**
 * AddressConsumer component
 * Manages address book synchronization and account state updates
 * This component doesn't render anything but handles important background tasks
 */
function AddressConsumer() {
  const { chainSS58 } = useApi();
  const { isWalletReady, walletAccounts } = useWallet();
  const { accounts, addresses } = useAccount();

  // Initialize address book from local storage
  // This effect runs once when the network changes to load stored addresses
  useLayoutEffect(() => {
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

  // Update address metadata when accounts or addresses change
  useEffect(() => {
    useAddressStore.setState((state) => {
      const newMetas = Object.fromEntries(Object.entries(state.metas).map((item) => [item[0], { ...item[1] }]));

      for (const account of accounts) {
        deriveAccountMeta(account, newMetas);
      }

      // delete injected accounts from metas
      for (const [, meta] of Object.entries(newMetas)) {
        delete meta.isInjected;
        delete meta.source;
        delete meta.cryptoType;
      }

      // add injected accounts to metas
      for (const account of walletAccounts) {
        const addressHex = addressToHex(account.address);

        newMetas[addressHex] = {
          ...newMetas[addressHex],
          isInjected: true,
          source: account.source,
          cryptoType: account.type || 'ed25519',
          name: account.name || newMetas[addressHex].name || ''
        } as AddressMeta;
      }

      for (const { name, address } of addresses) {
        const addressHex = addressToHex(address);

        newMetas[addressHex] = {
          ...newMetas[addressHex],
          name
        };
      }

      return {
        metas: newMetas
      };
    });
  }, [accounts, addresses, walletAccounts]);

  // Sync multisig accounts periodically
  // This effect handles initial sync and periodic updates of multisig account data
  useEffect(() => {
    let interval: any;

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
        const newAccounts = [...values, ...newWalletAccounts];

        return {
          accounts: isEqual(newAccounts, state.accounts) ? state.accounts : newAccounts,
          isMultisigSyned: true
        };
      });
    };

    if (isWalletReady) {
      // Initial sync when wallet is ready
      sync(chainSS58, walletAccounts, updateAccounts);

      // Set up periodic sync every 6 seconds
      interval = setInterval(() => {
        sync(chainSS58, walletAccounts, updateAccounts);
      }, 12000);
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(interval);
    };
  }, [isWalletReady, chainSS58, walletAccounts]);

  // Component doesn't render anything visible
  return null;
}

export default AddressConsumer;

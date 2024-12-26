// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isEqual } from 'lodash-es';
import { useEffect, useLayoutEffect } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { useAddressStore } from '@mimir-wallet/hooks/useAddressStore';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { store } from '@mimir-wallet/utils';
import { useWallet } from '@mimir-wallet/wallet/useWallet';

import { sync } from './sync';
import { useAccount } from './useAccount';
import { deriveAddressMeta } from './utils';

/**
 * AddressConsumer component
 * Manages address book synchronization and account state updates
 * This component doesn't render anything but handles important background tasks
 */
function AddressConsumer() {
  const { genesisHash, network } = useApi();
  const { isWalletReady, walletAccounts } = useWallet();
  const { accounts, addresses } = useAccount();

  // Initialize address book from local storage
  // This effect runs once when the network changes to load stored addresses
  useLayoutEffect(() => {
    // Helper function to get stored address values
    const getValues = () => {
      const values: { address: string; name: string; watchlist?: boolean; networks: string[] }[] = [];

      store.each((key: string, value) => {
        if (key.startsWith('address:0x')) {
          const v = value as {
            address: string;
            meta: { name: string; watchlist?: boolean; networks?: string[] };
          };

          if (v && v.address && v.meta?.name && (v.meta.networks ? v.meta.networks.includes(network) : true)) {
            try {
              values.push({
                address: encodeAddress(v.address),
                name: v.meta.name,
                watchlist: v.meta.watchlist,
                networks: v.meta.networks || []
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
  }, [network]);

  // Update address metadata when accounts or addresses change
  useEffect(() => {
    useAddressStore.setState({
      metas: deriveAddressMeta(accounts, addresses)
    });
  }, [accounts, addresses]);

  // Sync multisig accounts periodically
  // This effect handles initial sync and periodic updates of multisig account data
  useEffect(() => {
    let interval: any;

    if (isWalletReady) {
      // Initial sync when wallet is ready
      sync(genesisHash, walletAccounts, (values) => {
        useAddressStore.setState((state) => ({
          accounts: isEqual(values, state.accounts) ? state.accounts : values,
          isMultisigSyned: true
        }));
      });

      // Set up periodic sync every 6 seconds
      interval = setInterval(() => {
        sync(genesisHash, walletAccounts, (values) => {
          useAddressStore.setState((state) => ({
            accounts: isEqual(values, state.accounts) ? state.accounts : values,
            isMultisigSyned: true
          }));
        });
      }, 6000);
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(interval);
    };
  }, [genesisHash, isWalletReady, walletAccounts]);

  // Component doesn't render anything visible
  return null;
}

export default AddressConsumer;

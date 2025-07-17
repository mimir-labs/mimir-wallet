// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  MIGRATION_ALERT_DISMISSED_PREFIX,
  MIGRATION_ASSETS_ALERT_DISMISSED_PREFIX,
  MIGRATION_BATCH_ALERT_DISMISSED_PREFIX,
  MIGRATION_PURE_ALERT_DISMISSED_PREFIX,
  MIGRATION_TEMPLATE_ALERT_DISMISSED_PREFIX
} from '@/constants';
import { useMemo } from 'react';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { service, useLocalStore, useQuery } from '@mimir-wallet/service';

interface MigrationStatus {
  isAlertVisible: boolean;
  dismissAlert: () => void;
  resetAlert: () => void;
}

interface MigrationNetwork {
  chain: string;
  destChain: string;
  block?: number;
  status: 'pending' | 'completed';
}

export function useMigrationStatus(chain: string, isComplete: boolean): MigrationStatus {
  const [isDismissed, setIsDismissed] = useLocalStore(
    `${MIGRATION_ALERT_DISMISSED_PREFIX}${chain}:${isComplete}`,
    false
  );

  const dismissAlert = () => {
    setIsDismissed(true);
  };

  const resetAlert = () => {
    setIsDismissed(false);
  };

  return {
    isAlertVisible: !isDismissed,
    dismissAlert,
    resetAlert
  };
}

export function useMigrationNetworks() {
  return useQuery<MigrationNetwork[]>({
    queryKey: [],
    queryHash: 'migration-networks',
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      return service.chain.getMigrationStatus();
    }
  });
}

export function useNetworkMigrationCompleted(chain: string) {
  const { data: migrationNetworks } = useMigrationNetworks();

  const migrationNetwork = useMemo(
    () => migrationNetworks?.find((network) => network.chain === chain),
    [migrationNetworks, chain]
  );

  return {
    completed: migrationNetwork?.status === 'completed',
    chain: chain,
    destChain: migrationNetwork?.destChain,
    block: migrationNetwork?.block
  };
}

export function useAssetsMigrationStatus(chain: string): MigrationStatus {
  const [isDismissed, setIsDismissed] = useLocalStore(`${MIGRATION_ASSETS_ALERT_DISMISSED_PREFIX}${chain}`, false);

  const dismissAlert = () => {
    setIsDismissed(true);
  };

  const resetAlert = () => {
    setIsDismissed(false);
  };

  return {
    isAlertVisible: !isDismissed,
    dismissAlert,
    resetAlert
  };
}

export function useBatchMigrationStatus(chain: string, address: string): MigrationStatus {
  const [isDismissed, setIsDismissed] = useLocalStore(
    `${MIGRATION_BATCH_ALERT_DISMISSED_PREFIX}${chain}:${address}`,
    false
  );

  const dismissAlert = () => {
    setIsDismissed(true);
  };

  const resetAlert = () => {
    setIsDismissed(false);
  };

  return {
    isAlertVisible: !isDismissed,
    dismissAlert,
    resetAlert
  };
}

export function useTemplateMigrationStatus(chain: string): MigrationStatus {
  const [isDismissed, setIsDismissed] = useLocalStore(`${MIGRATION_TEMPLATE_ALERT_DISMISSED_PREFIX}${chain}`, false);

  const dismissAlert = () => {
    setIsDismissed(true);
  };

  const resetAlert = () => {
    setIsDismissed(false);
  };

  return {
    isAlertVisible: !isDismissed,
    dismissAlert,
    resetAlert
  };
}

export function usePureMigrationStatus(chain: string, address: string): MigrationStatus {
  const addressHex = useMemo(() => addressToHex(address), [address]);
  const [isDismissed, setIsDismissed] = useLocalStore(
    `${MIGRATION_PURE_ALERT_DISMISSED_PREFIX}${chain}:${addressHex}`,
    false
  );

  const dismissAlert = () => {
    setIsDismissed(true);
  };

  const resetAlert = () => {
    setIsDismissed(false);
  };

  return {
    isAlertVisible: !isDismissed,
    dismissAlert,
    resetAlert
  };
}

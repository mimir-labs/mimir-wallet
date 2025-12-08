// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { service, useLocalStore, useQuery } from '@mimir-wallet/service';
import { useMemo } from 'react';

import {
  MIGRATION_ALERT_DISMISSED_PREFIX,
  MIGRATION_ASSETS_ALERT_DISMISSED_PREFIX,
  MIGRATION_BATCH_ALERT_DISMISSED_PREFIX,
  MIGRATION_TEMPLATE_ALERT_DISMISSED_PREFIX,
} from '@/constants';

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
  updatedAt: string;
}

export function useMigrationStatus(
  chain: string,
  isComplete: boolean,
): MigrationStatus {
  const [isDismissed, setIsDismissed] = useLocalStore(
    `${MIGRATION_ALERT_DISMISSED_PREFIX}${chain}:${isComplete}`,
    false,
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
    resetAlert,
  };
}

export function useMigrationNetworks() {
  return useQuery<MigrationNetwork[]>({
    queryKey: ['migration-networks'],
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      return service.chain
        .getMigrationStatus()
        .then((list: MigrationNetwork[]) =>
          list.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
    },
  });
}

export function useNetworkMigrationCompleted(chain: string) {
  const { data: migrationNetworks } = useMigrationNetworks();

  const migrationNetwork = useMemo(
    () => migrationNetworks?.find((network) => network.chain === chain),
    [migrationNetworks, chain],
  );

  return {
    completed: migrationNetwork?.status === 'completed',
    chain: chain,
    destChain: migrationNetwork?.destChain,
    block: migrationNetwork?.block,
  };
}

export function useAssetsMigrationStatus(chain: string): MigrationStatus {
  const [isDismissed, setIsDismissed] = useLocalStore(
    `${MIGRATION_ASSETS_ALERT_DISMISSED_PREFIX}${chain}`,
    false,
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
    resetAlert,
  };
}

export function useBatchMigrationStatus(
  chain: string,
  address: string,
): MigrationStatus {
  const [isDismissed, setIsDismissed] = useLocalStore(
    `${MIGRATION_BATCH_ALERT_DISMISSED_PREFIX}${chain}:${address}`,
    false,
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
    resetAlert,
  };
}

export function useTemplateMigrationStatus(chain: string): MigrationStatus {
  const [isDismissed, setIsDismissed] = useLocalStore(
    `${MIGRATION_TEMPLATE_ALERT_DISMISSED_PREFIX}${chain}`,
    false,
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
    resetAlert,
  };
}

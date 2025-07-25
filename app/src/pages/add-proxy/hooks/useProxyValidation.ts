// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { useAccount } from '@/accounts/useAccount';
import { useMemo } from 'react';

import { addressEq } from '@mimir-wallet/polkadot-core';

interface ProxyConfiguration {
  proxied?: string;
  proxy?: string;
  isPureProxy: boolean;
  proxyType: string;
  hasDelay: boolean;
  delayType: string;
  customBlocks: string;
}

interface ValidationResult {
  isValid: boolean;
  canProceed: boolean;
  errors: string[];
  filteredProxyAddresses: string[];
  filteredProxiedAddresses: string[];
}

/**
 * Hook for validating proxy configuration and filtering available addresses
 * Handles validation logic for proxy setup wizard
 */
export function useProxyValidation(config: ProxyConfiguration, genesisHash: HexString): ValidationResult {
  const { accounts, addresses } = useAccount();

  // Filter accounts by network for proxied accounts
  const filteredProxiedAddresses = useMemo(() => {
    return accounts
      .filter((account: AccountData) => (account.type === 'pure' ? account.network === genesisHash : true))
      .map((item) => item.address);
  }, [accounts, genesisHash]);

  // Filter addresses for proxy accounts (includes both accounts and address book)
  const filteredProxyAddresses = useMemo(() => {
    return filteredProxiedAddresses.concat(addresses.map((item) => item.address));
  }, [filteredProxiedAddresses, addresses]);

  const validationResult = useMemo(() => {
    const errors: string[] = [];

    // Basic validation
    if (!config.isPureProxy && !config.proxied) {
      errors.push('Proxied account is required');
    }

    if (!config.proxy) {
      errors.push('Proxy account is required');
    }

    // Prevent self-proxy for regular proxy
    if (!config.isPureProxy && config.proxied && config.proxy && addressEq(config.proxied, config.proxy)) {
      errors.push('Proxy account cannot be the same as proxied account');
    }

    // Validate custom delay blocks
    if (config.hasDelay && config.delayType === 'custom') {
      const customBlocks = Number(config.customBlocks);

      if (isNaN(customBlocks) || customBlocks < 0) {
        errors.push('Custom delay blocks must be a positive number');
      }
    }

    // Check if configuration is complete for proceeding
    const canProceed = config.isPureProxy ? !!config.proxy : !!(config.proxied && config.proxy);

    return {
      isValid: errors.length === 0,
      canProceed: canProceed && errors.length === 0,
      errors,
      filteredProxyAddresses,
      filteredProxiedAddresses
    };
  }, [
    config.isPureProxy,
    config.proxied,
    config.proxy,
    config.hasDelay,
    config.delayType,
    config.customBlocks,
    filteredProxyAddresses,
    filteredProxiedAddresses
  ]);

  return validationResult;
}

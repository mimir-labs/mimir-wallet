// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

export interface SafetyCheckResult {
  hasWarnings: boolean;
  indirectControllers: string[];
  warnings: string[];
  severity: 'info' | 'warning' | 'error';
}

export interface ProxyConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Service for proxy safety checks and validation
 * Provides unified safety logic for both desktop and mobile
 */
export class ProxySafetyService {
  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
  }

  /**
   * Check for indirect controllers
   * Detects if proxy account has its own proxies that could indirectly control the target
   */
  async checkIndirectControllers(proxyAddress: string): Promise<SafetyCheckResult> {
    try {
      const detected: Set<string> = new Set();
      const warnings: string[] = [];
      const queryResult = await this.api.query.proxy.proxies(proxyAddress);

      // Check each proxy relationship
      for (const item of queryResult[0]) {
        const proxyType = item.proxyType.type;

        // Only consider proxies that can control the account fully
        if (proxyType === 'Any' || (proxyType as string) === 'NonTransfer') {
          detected.add(item.delegate.toString());
        }
      }

      if (detected.size > 0) {
        warnings.push(
          `The proxy account has ${detected.size} controller(s) that could indirectly control your account`
        );
      }

      return {
        hasWarnings: detected.size > 0,
        indirectControllers: Array.from(detected),
        warnings,
        severity: detected.size > 0 ? 'warning' : 'info'
      };
    } catch (error: any) {
      return {
        hasWarnings: true,
        indirectControllers: [],
        warnings: [error?.message || 'Failed to check proxy safety'],
        severity: 'error'
      };
    }
  }
}

/**
 * Factory function to create ProxySafetyService instance
 */
export function createProxySafetyService(api: ApiPromise): ProxySafetyService {
  return new ProxySafetyService(api);
}

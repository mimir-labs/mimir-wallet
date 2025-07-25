// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';

import { createProxySafetyService, type SafetyCheckResult } from '../services/proxySafetyService';

interface ExtendedSafetyCheckResult extends SafetyCheckResult {
  isLoading: boolean;
  error: Error | null;
}

/**
 * Enhanced hook for performing comprehensive proxy safety checks
 * Uses the centralized ProxySafetyService for unified logic
 */
export function useProxySafetyCheck() {
  const { api } = useApi();
  const safetyService = useMemo(() => createProxySafetyService(api), [api]);

  const [result, setResult] = useState<ExtendedSafetyCheckResult>({
    hasWarnings: false,
    indirectControllers: [],
    warnings: [],
    severity: 'info',
    isLoading: false,
    error: null
  });

  // Legacy method for backward compatibility
  const checkSafety = useCallback(
    async (proxyAddress?: string): Promise<ExtendedSafetyCheckResult> => {
      if (!proxyAddress) {
        const emptyResult: ExtendedSafetyCheckResult = {
          hasWarnings: false,
          indirectControllers: [],
          warnings: [],
          severity: 'info',
          isLoading: false,
          error: null
        };

        setResult(emptyResult);

        return emptyResult;
      }

      setResult((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const safetyResult = await safetyService.checkIndirectControllers(proxyAddress);

        const finalResult: ExtendedSafetyCheckResult = {
          ...safetyResult,
          isLoading: false,
          error: null
        };

        setResult(finalResult);

        return finalResult;
      } catch (error) {
        const errorResult: ExtendedSafetyCheckResult = {
          hasWarnings: true,
          indirectControllers: [],
          warnings: ['Failed to check proxy safety'],
          severity: 'error',
          isLoading: false,
          error: error as Error
        };

        setResult(errorResult);

        return errorResult;
      }
    },
    [safetyService]
  );

  return {
    // Legacy API for backward compatibility
    checkSafety,
    result
  };
}

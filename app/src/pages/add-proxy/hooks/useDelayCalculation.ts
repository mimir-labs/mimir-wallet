// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@/constants';
import { useBlockInterval } from '@/hooks/useBlockInterval';
import { useMemo } from 'react';

export type DelayType = 'hour' | 'day' | 'week' | 'custom';

interface DelayCalculationOptions {
  delayType: DelayType;
  customBlocks?: string;
  hasDelay?: boolean;
}

interface DelayCalculationResult {
  delayInBlocks: number;
  delayDisplay: string;
}

/**
 * Hook for calculating proxy delay in blocks and display format
 * Handles conversion between time units and blockchain blocks
 */
export function useDelayCalculation({
  delayType,
  customBlocks = '0',
  hasDelay = true
}: DelayCalculationOptions): DelayCalculationResult {
  const blockInterval = useBlockInterval().toNumber();

  const delayInBlocks = useMemo(() => {
    if (!hasDelay) return 0;

    if (delayType === 'custom') {
      return Number(customBlocks) || 0;
    }

    const delays = {
      hour: Math.floor((ONE_HOUR * 1000) / blockInterval),
      day: Math.floor((ONE_DAY * 1000) / blockInterval),
      week: Math.floor((ONE_DAY * 7 * 1000) / blockInterval)
    };

    return delays[delayType];
  }, [hasDelay, delayType, customBlocks, blockInterval]);

  const delayDisplay = useMemo(() => {
    if (!hasDelay) return 'No delay';

    if (delayType === 'custom') {
      const blocks = Number(customBlocks);
      const timeMs = blocks * blockInterval;

      if (timeMs > ONE_DAY * 1000) {
        return `${Math.round(timeMs / (ONE_DAY * 1000))} days (${blocks} blocks)`;
      }

      if (timeMs > ONE_HOUR * 1000) {
        return `${Math.round(timeMs / (ONE_HOUR * 1000))} hours (${blocks} blocks)`;
      }

      return `${Math.round(timeMs / (ONE_MINUTE * 1000))} minutes (${blocks} blocks)`;
    }

    return `1 ${delayType.charAt(0).toUpperCase() + delayType.slice(1)}`;
  }, [hasDelay, delayType, customBlocks, blockInterval]);

  return {
    delayInBlocks,
    delayDisplay
  };
}

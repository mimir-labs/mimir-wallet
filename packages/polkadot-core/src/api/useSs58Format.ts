// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Ss58FormatControl } from '../types/types.js';

import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { allEndpoints } from '../chains/config.js';

import { ApiManager } from './ApiManager.js';
import { useApiStore } from './useApiStore.js';

/**
 * Hook to control SS58 format for address display
 *
 * SS58 format determines how addresses are encoded and displayed.
 * Different chains use different SS58 prefixes (e.g., Polkadot uses 0, Kusama uses 2).
 *
 * @returns Ss58FormatControl object with SS58 format and control functions
 *
 * @example
 * ```tsx
 * const { ss58, chainInfo, setSs58Chain } = useSs58Format();
 *
 * // Display current SS58 format
 * console.log(`Current format: ${ss58} (${chainInfo.name})`);
 *
 * // Change SS58 chain
 * setSs58Chain('kusama');
 * ```
 */
export function useSs58Format(): Ss58FormatControl {
  const { ss58Chain, setSs58Chain } = useApiStore(
    useShallow((state) => ({
      ss58Chain: state.ss58Chain,
      setSs58Chain: state.setSs58Chain,
    })),
  );

  const chainInfo = useMemo(
    () => ApiManager.resolveChain(ss58Chain) ?? allEndpoints[0],
    [ss58Chain],
  );

  return {
    ss58: chainInfo.ss58Format,
    ss58Chain,
    chainInfo,
    setSs58Chain,
  };
}

// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { useMemo } from 'react';

import { useAccount } from './useAccount';

/**
 * Get account metadata for a specific address
 * @param address - Account address
 * @returns Account metadata or undefined if not found
 */
export function useAccountMeta(address: string): AddressMeta | undefined {
  const { metas } = useAccount();

  return useMemo(() => {
    const addressHex = addressToHex(address);

    return metas[addressHex];
  }, [address, metas]);
}

// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';

import { useQuery } from '@mimir-wallet/service';
import { useMemo } from 'react';

/**
 * Hook to estimate gas fee for a transaction with a specific asset
 */
export function useGasFeeEstimate(
  extrinsic: SubmittableExtrinsic<'promise'> | null,
  signer?: string,
): bigint | undefined | null {
  const extrinsicHex = useMemo(() => extrinsic?.toHex(), [extrinsic]);

  // Query gas fee in native token
  const { data: gasFeeData } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps -- extrinsic is represented by extrinsicHex
    queryKey: ['gas-fee-estimate', extrinsicHex, signer] as const,
    queryFn: async (): Promise<{ partialFee: any; weight: any }> => {
      if (!extrinsic || !signer) {
        throw new Error('Extrinsic and signer are required');
      }

      try {
        const info = await extrinsic.paymentInfo(signer);

        return {
          partialFee: info.partialFee,
          weight: info.weight.refTime || info.weight,
        };
      } catch (error) {
        console.error('Failed to query gas fee:', error);
        throw error;
      }
    },
    enabled: !!extrinsicHex && !!signer,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1,
  });

  return useMemo(() => {
    return gasFeeData?.partialFee.toBigInt();
  }, [gasFeeData]);
}

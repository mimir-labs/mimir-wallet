// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';

import { blake2AsHex } from '@polkadot/util-crypto';
import { useMemo } from 'react';

import { useQuery } from '@mimir-wallet/service';

/**
 * Hook to estimate gas fee for a transaction with a specific asset
 */
export function useGasFeeEstimate(
  extrinsic: SubmittableExtrinsic<'promise'> | null,
  signer?: string
): bigint | undefined | null {
  const extrinsicHex = useMemo(() => extrinsic?.toHex(), [extrinsic]);
  // Query gas fee in native token
  const { data: gasFeeData } = useQuery({
    queryKey: [extrinsic, signer] as const,
    queryHash: `gas-fee-estimate-${blake2AsHex(extrinsicHex ?? '')}-${signer}`,
    queryFn: async ({ queryKey }) => {
      const [extrinsic, signer] = queryKey;

      if (!extrinsic || !signer) {
        throw new Error('Extrinsic is not defined');
      }

      try {
        const info = await extrinsic.paymentInfo(signer);

        return {
          partialFee: info.partialFee,
          weight: info.weight.refTime || info.weight
        };
      } catch (error) {
        console.error('Failed to query gas fee:', error);
        throw error;
      }
    },
    enabled: !!extrinsicHex && !!signer,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1
  });

  return useMemo(() => {
    return gasFeeData?.partialFee.toBigInt();
  }, [gasFeeData]);
}

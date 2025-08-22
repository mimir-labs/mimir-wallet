// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { isEqual } from 'lodash-es';

import { type CompleteEnhancedAssetInfo, service, useQuery } from '@mimir-wallet/service';

export const queryXcmAssetKey = (chain: string, identifier: string) => ['query-xcm-asset', chain, identifier];

export function useXcmAsset(
  chain?: string,
  identifier?: 'native' | HexString | string | null
): [data: CompleteEnhancedAssetInfo | undefined, isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery({
    queryKey: queryXcmAssetKey(chain || '', identifier || ''),
    queryFn: async (): Promise<CompleteEnhancedAssetInfo> => {
      if (!identifier || !chain) {
        throw new Error('identifier is required');
      }

      return service.asset.getXcmAsset(chain, identifier);
    },
    refetchInterval: 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!chain && !!identifier,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [data, isFetched, isFetching];
}

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { findAsset } from '@/config/tokens';
import { isEqual } from 'lodash-es';
import { useMemo } from 'react';

import { getChainIcon } from '@mimir-wallet/polkadot-core';
import { type CompleteEnhancedAssetInfo, service, useQuery } from '@mimir-wallet/service';

export const queryXcmAssetKey = (chain: string, identifier: string) => ['query-xcm-asset', chain, identifier];

// Helper function to enhance asset with local icon
function enhanceAssetWithLocalIcon(asset: CompleteEnhancedAssetInfo, network: string): CompleteEnhancedAssetInfo {
  let localIcon: string | undefined;

  if (asset.isNative) {
    // Native token: get icon from polkadot-core config
    const chainInfo = getChainIcon(network);

    localIcon = chainInfo?.tokenIcon;
  } else {
    // Non-native asset: get icon from tokens config
    const identifier = asset.assetId || asset.key;
    const assetConfig = findAsset(network, identifier);

    localIcon = assetConfig?.Icon;
  }

  return {
    ...asset,
    logoUri: localIcon || asset.logoUri // Prioritize local icon
  };
}

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

  // Enhance data with local icon
  const enhancedData = useMemo(() => {
    if (!data || !chain) return data;

    return enhanceAssetWithLocalIcon(data, chain);
  }, [data, chain]);

  return [enhancedData, isFetched, isFetching];
}

export function useAllXcmAsset() {
  const { data, isFetched, isFetching, promise } = useQuery({
    queryKey: ['get-all-xcm-asset'],
    queryFn: () => service.asset.getAllXcmAsset(),
    refetchInterval: 60 * 10 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  // Enhance all assets with local icons
  const enhancedData = useMemo(() => {
    if (!data) return data;

    const enhancedAssets: Record<string, CompleteEnhancedAssetInfo[]> = {};

    for (const [network, assets] of Object.entries(data)) {
      enhancedAssets[network] = assets.map((asset) => enhanceAssetWithLocalIcon(asset, network));
    }

    return enhancedAssets;
  }, [data]);

  return [enhancedData, isFetched, isFetching, promise] as const;
}

export function useChainXcmAsset(network: string) {
  const [data, isFetched, isFetching, promise] = useAllXcmAsset();

  return useMemo(() => {
    return [data?.[network] || [], isFetched, isFetching, () => promise.then((data) => data[network] ?? [])] as const;
  }, [data, isFetched, isFetching, network, promise]);
}

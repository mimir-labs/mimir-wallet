// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Enum } from '@polkadot/types';
import type { StagingXcmV4Asset, StagingXcmV5Asset, XcmV3MultiAsset, XcmVersionedAssets } from '@polkadot/types/lookup';
import type { HexString } from '@mimir-wallet/service';
import type { LocationInfo, SupportXcmChainConfig, XcmChainConfig } from './types.js';

import { loopLocation, parseJunctions } from './parseLocation.js';

interface XcmVersionedAsset extends Enum {
  readonly isV3: boolean;
  readonly asV3: XcmV3MultiAsset;
  readonly isV4: boolean;
  readonly asV4: StagingXcmV4Asset;
  readonly isV5: boolean;
  readonly asV5: StagingXcmV5Asset;
  readonly type: 'V3' | 'V4' | 'V5';
}

/**
 * Parse XCM assets and extract asset IDs
 * Supports both XcmVersionedAssets (array) and single asset types
 * @param assets - XCM versioned assets or asset
 * @returns Array of asset IDs as strings
 */
export function parseAssets(assets: XcmVersionedAssets | XcmVersionedAsset, initialChain: SupportXcmChainConfig) {
  const list = (() => {
    if (assets.isV3) {
      const list = assets.asV3;

      if (Array.isArray(list)) {
        return list
          .filter((item) => item.id.isConcrete)
          .map((item) => ({
            amount: item.fun.isFungible ? item.fun.asFungible.toString() : '0',
            location: item.id.asConcrete
          }));
      } else {
        return list.id.isConcrete
          ? [{ amount: list.fun.isFungible ? list.fun.asFungible.toString() : '0', location: list.id.asConcrete }]
          : [];
      }
    } else if (assets.isV4) {
      const list = assets.asV4;

      if (Array.isArray(list)) {
        return list.map((item) => ({
          amount: item.fun.isFungible ? item.fun.asFungible.toString() : '0',
          location: item.id
        }));
      } else {
        return [
          {
            amount: list.fun.isFungible ? list.fun.asFungible.toString() : '0',
            location: list.id
          }
        ];
      }
    } else if (assets.isV5) {
      const list = assets.asV5;

      if (Array.isArray(list)) {
        return list.map((item) => ({
          amount: item.fun.isFungible ? item.fun.asFungible.toString() : '0',
          location: item.id
        }));
      } else {
        return [
          {
            amount: list.fun.isFungible ? list.fun.asFungible.toString() : '0',
            location: list.id
          }
        ];
      }
    } else {
      throw new Error(`Unsupport XcmVersionedAssets version ${assets.toHuman()}`);
    }
  })();

  const results: Array<{
    chain: XcmChainConfig;
    assetKey?: HexString | null;
    assetId?: string | null;
    isNative: boolean;
    amount: string;
  }> = [];

  for (const item of list) {
    const locationInfo: LocationInfo = {
      parents: item.location.parents.toNumber(),
      interiors: parseJunctions(item.location.interior)
    };

    try {
      const { chain, generalIndex, generalKey } = loopLocation(locationInfo, initialChain);

      results.push({
        chain,
        assetKey: generalKey ? generalKey : null,
        assetId: generalIndex ? generalIndex : null,
        isNative: !generalIndex && !generalKey,
        amount: item.amount
      });
    } catch {
      /* empty */
    }
  }

  return results;
}

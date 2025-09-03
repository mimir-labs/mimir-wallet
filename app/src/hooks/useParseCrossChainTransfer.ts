// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { XcmVersionedLocation } from '@polkadot/types/lookup';
import type { Codec, IMethod, Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { useMemo } from 'react';

import {
  type Endpoint,
  findAction,
  findDestChain,
  parseAccountFromLocation,
  parseAssets,
  type XcmChainConfig
} from '@mimir-wallet/polkadot-core';

export interface AssetTransfer {
  chain: XcmChainConfig;
  assetKey?: HexString | null;
  assetId?: string | null;
  isNative: boolean;
  amount: string;
}
export interface CrossChainTransferInfo {
  destination: XcmChainConfig;
  beneficiary: string | null;
  assets: AssetTransfer[];
}

function parseXcmAssets(assets: Codec, initialChain: Endpoint): AssetTransfer[] {
  return parseAssets(assets as any, { isSupport: true, ...initialChain });
}

function parseDestChain(destination: Codec, initialChain: Endpoint) {
  return findDestChain(destination as XcmVersionedLocation, { isSupport: true, ...initialChain }).chain;
}

export function useParseCrossChainTransfer(
  registry: Registry,
  chain: Endpoint,
  call?: IMethod | null
): CrossChainTransferInfo | null {
  const results = useMemo((): CrossChainTransferInfo | null => {
    try {
      if (!call) {
        return null;
      }

      const action = findAction(registry, call);

      if (!action) {
        return null;
      }

      const [section, method] = action;

      // Check for XCM methods
      if (section === 'polkadotXcm' || section === 'xcmPallet') {
        if (
          method === 'reserveTransferAssets' ||
          method === 'limitedReserveTransferAssets' ||
          method === 'teleportAssets' ||
          method === 'limitedTeleportAssets' ||
          method === 'transferAssets'
        ) {
          const destination = call.args[0];
          const beneficiary = call.args[1];
          const assets = call.args[2];

          console.log(destination.toHuman(), beneficiary.toHuman(), assets.toHuman());

          return {
            destination: parseDestChain(destination, chain),
            beneficiary: parseAccountFromLocation(beneficiary as any),
            assets: parseXcmAssets(assets, chain)
          };
        }
      } else if (section === 'xTokens' || section === 'ormlXTokens') {
        if (method === 'transfer' || method === 'transferMulticurrency') {
          // xTokens.transfer(currency_id, amount, dest, dest_weight)
          const currencyId = call.args[0].toHex();
          const amount = call.args[1].toString();
          const dest = call.args[2];

          return {
            destination: parseDestChain(dest, chain),
            beneficiary: parseAccountFromLocation(dest as any),
            assets: [{ chain: { isSupport: true, ...chain }, isNative: false, assetKey: currencyId, amount }]
          };
        } else if (method === 'transferMultiasset' || method === 'transferMultiassetWithFee') {
          // xTokens.transferMultiasset(asset, dest, dest_weight)
          const asset = call.args[0];
          const dest = call.args[1];

          return {
            destination: parseDestChain(dest, chain),
            beneficiary: parseAccountFromLocation(dest as any),
            assets: parseXcmAssets(asset, chain)
          };
        } else if (method === 'transferMultiassets') {
          // xTokens.transferMultiassets(assets, fee_item, dest, dest_weight)
          const assets = call.args[0];
          const dest = call.args[2];

          return {
            destination: parseDestChain(dest, chain),
            beneficiary: parseAccountFromLocation(dest as any),
            assets: parseXcmAssets(assets, chain)
          };
        }
      }

      return null;
    } catch (error) {
      console.error(error);

      return null;
    }
  }, [call, chain, registry]);

  return results;
}

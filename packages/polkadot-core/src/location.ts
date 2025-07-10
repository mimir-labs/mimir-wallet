// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AnyNumber } from '@polkadot/types-codec/types';

export const getFeeAssetLocation = (api: ApiPromise, assetId?: string | null): AnyNumber | object | undefined => {
  if (!assetId) {
    return undefined;
  }

  const metadata = api.registry.metadata;

  const palletIndex = metadata.pallets.filter((a) => a.name.toString() === 'Assets')[0].index.toString();

  // FIX ME: Might have to fix it later as it may not be applicable for all chains
  const palletInstance = { PalletInstance: palletIndex };
  const generalIndex = { GeneralIndex: assetId };

  return {
    interior: { X2: [palletInstance, generalIndex] },
    parents: 0
  };
};

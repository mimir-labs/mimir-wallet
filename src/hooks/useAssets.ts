// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetDetails, PalletAssetsAssetMetadata } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import type { AssetInfo, AssetInfoBase } from './types';

import { Asset, findAssets } from '@mimir-wallet/config';
import { useEffect, useState } from 'react';

import { useApi } from './useApi';

function _transform(assets: Asset[], assetValues: Option<PalletAssetsAssetDetails>[], metadataValues: PalletAssetsAssetMetadata[]): AssetInfo[] {
  const assetInfo: AssetInfo[] = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assetValues[i];
    const metadata = metadataValues[i];

    if (asset.isSome) {
      const assetValue = asset.unwrap();

      assetInfo.push({
        ...assets[i],
        isNative: false,
        name: metadata.name.toUtf8(),
        symbol: metadata.symbol.toUtf8(),
        decimals: metadata.decimals.toNumber(),
        assetsInfo: {
          owner: assetValue.owner.toString(),
          issuer: assetValue.issuer.toString(),
          admin: assetValue.admin.toString(),
          freezer: assetValue.freezer.toString(),
          supply: assetValue.supply,
          deposit: assetValue.deposit,
          minBalance: assetValue.minBalance,
          isSufficient: assetValue.isSufficient.isTrue,
          accounts: assetValue.accounts.toNumber(),
          sufficients: assetValue.sufficients.toNumber(),
          approvals: assetValue.approvals.toNumber(),
          status: assetValue.status
        }
      });
    }
  }

  return assetInfo;
}

export function useAssets(): AssetInfo[] {
  const { api, isApiReady } = useApi();
  const [allAssets, setAllAssets] = useState<AssetInfo[]>([]);

  useEffect(() => {
    if (isApiReady && api.query.assets) {
      const assets = findAssets(api.genesisHash.toHex());
      const ids = assets.map((item) => item.assetId);

      Promise.all([api.query.assets.asset.multi(ids), api.query.assets.metadata.multi(ids)]).then(([assetsResults, metadatas]) => {
        setAllAssets(_transform(assets, assetsResults, metadatas));
      });
    }
  }, [isApiReady, api]);

  return allAssets;
}

export function useAssetInfo(assetId?: string | BN): AssetInfoBase | undefined {
  const { api, isApiReady } = useApi();
  const [info, setInfo] = useState<AssetInfoBase>();

  useEffect(() => {
    if (isApiReady && assetId && api.query.assets) {
      api.query.assets.metadata(assetId).then((metadata) => {
        setInfo({
          isNative: false,
          name: metadata.name.toUtf8(),
          symbol: metadata.symbol.toUtf8(),
          decimals: metadata.decimals.toNumber()
        });
      });
    }
  }, [isApiReady, api, assetId]);

  return info;
}

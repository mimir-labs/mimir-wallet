// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetMetadata } from '@polkadot/types/lookup';
import type { AssetInfo, PalletAssetRegistryAssetDetails } from './types';

import { type BN, BN_ZERO } from '@polkadot/util';
import { useQuery } from '@tanstack/react-query';

import { Asset, findAssets } from '@mimir-wallet/config';

import { useApi } from './useApi';

function _transform(assets: Asset[], metadatas: [id: string, metadata: PalletAssetsAssetMetadata][]): AssetInfo[] {
  const assetInfo: AssetInfo[] = [];

  for (const [id, metadata] of metadatas) {
    const asset = assets.find((item) => item.assetId === id);

    assetInfo.push({
      isNative: false,
      name: metadata.name.toUtf8(),
      symbol: metadata.symbol.toUtf8(),
      decimals: metadata.decimals.toNumber(),
      icon: asset?.Icon,
      assetId: id
    });
  }

  return assetInfo.sort((l) => (l.icon ? -1 : 1));
}

function _transformAssetRegistry(
  assets: Asset[],
  metadatas: [id: string, metadata: Option<PalletAssetRegistryAssetDetails>][]
): AssetInfo[] {
  const assetInfo: AssetInfo[] = [];

  for (const [id, metadata] of metadatas) {
    const asset = assets.find((item) => item.assetId === id);

    if (metadata.isSome) {
      const { name, symbol, decimals } = metadata.unwrap();

      if (name.isSome && symbol.isSome && decimals.isSome) {
        assetInfo.push({
          isNative: false,
          name: name.unwrap().toUtf8(),
          symbol: symbol.unwrap().toUtf8(),
          decimals: decimals.unwrap().toNumber(),
          icon: asset?.Icon,
          assetId: id
        });
      }
    }
  }

  return assetInfo.sort((l) => (l.icon ? -1 : 1));
}

async function fetchAssets({ queryKey }: { queryKey: [ApiPromise] }): Promise<AssetInfo[]> {
  const api = queryKey[0];
  const configAssets = findAssets(api.genesisHash.toHex());

  if (api.query.assets) {
    return Promise.all([api.query.assets.metadata.entries(), api.query.foreignAssets.metadata.entries()]).then(
      ([_metadatas, _foreignMetadatas]) => {
        const metadatas: [string, PalletAssetsAssetMetadata][] = _metadatas.map(([key, value]) => [
          key.args[0].toString(),
          value
        ]);
        const foreignMetadatas = _foreignMetadatas.map(
          ([key, value]) => [key.args[0].toHex(), value] as [string, PalletAssetsAssetMetadata]
        );

        return _transform(configAssets, metadatas.concat(foreignMetadatas));
      }
    );
  } else if (api.query.assetRegistry?.assets) {
    return api.query.assetRegistry.assets.entries().then((entries) => {
      const assets = entries.map(
        ([key, value]) => [key.args[0].toString(), value] as [string, Option<PalletAssetRegistryAssetDetails>]
      );

      return _transformAssetRegistry(configAssets, assets);
    });
  }

  return Promise.resolve([]);
}

export function useAssets(): AssetInfo[] {
  const { api, isApiReady } = useApi();
  const { data } = useQuery({
    queryKey: [api] as const,
    queryHash: api.genesisHash.toHex(),
    refetchInterval: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: fetchAssets,
    enabled: isApiReady
  });

  return data ?? [];
}

async function fetchAssetInfo({
  queryKey
}: {
  queryKey: [ApiPromise, string | undefined | null];
}): Promise<[AssetInfo<false>, BN] | undefined> {
  const [api, assetId] = queryKey;

  if (!assetId) {
    return Promise.resolve(undefined);
  }

  if (api.query.assets) {
    return Promise.all([api.query.assets.metadata(assetId), api.query.assets.asset(assetId)]).then(
      ([metadata, asset]) => {
        return [
          {
            isNative: false,
            assetId: assetId.toString(),
            name: metadata.name.toUtf8(),
            symbol: metadata.symbol.toUtf8(),
            decimals: metadata.decimals.toNumber(),
            existentialDeposit: metadata.deposit.toBigInt(),
            icon: findAssets(api.genesisHash.toHex()).find((item) => item.assetId === assetId)?.Icon
          },
          asset.unwrapOrDefault().minBalance
        ];
      }
    );
  } else if (api.query.assetRegistry?.assets) {
    return api.query.assetRegistry.assets(assetId).then((metadata) => {
      if ((metadata as Option<PalletAssetRegistryAssetDetails>).isSome) {
        const { name, symbol, decimals, existentialDeposit } = (
          metadata as Option<PalletAssetRegistryAssetDetails>
        ).unwrap();

        if (name.isSome && symbol.isSome && decimals.isSome) {
          return [
            {
              isNative: false,
              assetId: assetId.toString(),
              name: name.unwrap().toUtf8(),
              symbol: symbol.unwrap().toUtf8(),
              decimals: decimals.unwrap().toNumber(),
              icon: findAssets(api.genesisHash.toHex()).find((item) => item.assetId === assetId)?.Icon
            },
            existentialDeposit
          ];
        }
      }

      return undefined;
    });
  } else {
    return Promise.resolve(undefined);
  }
}

export function useAssetInfo(assetId?: string | null): [AssetInfo<false> | undefined, BN] {
  const { api, isApiReady } = useApi();
  const { data } = useQuery({
    queryKey: [api, assetId] as const,
    queryHash: `${api.genesisHash.toHex()}-${assetId}`,
    queryFn: fetchAssetInfo,
    refetchInterval: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: isApiReady && !!assetId
  });

  return [data?.[0], data?.[1] ?? BN_ZERO];
}

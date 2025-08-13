// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetDetails, PalletAssetsAssetMetadata } from '@polkadot/types/lookup';
import type { AssetInfo, AssetMetadata, PalletAssetRegistryAssetDetails } from './types';

import { findAsset } from '@/config';
import { type BN, BN_ZERO, isHex } from '@polkadot/util';
import { isEqual } from 'lodash-es';
import { useMemo } from 'react';

import { addressToHex, useApi, type ValidApiState } from '@mimir-wallet/polkadot-core';
import { service, useQuery } from '@mimir-wallet/service';

function _extraAsset(
  network: string,
  data: {
    assetId: string;
    name: string;
    symbol: string;
    decimals: number;
    price?: number;
    change24h?: number;
  }[]
): AssetInfo[] {
  return data.map((item) => {
    const asset = findAsset(network, item.assetId);

    return {
      network: network,
      isNative: false,
      assetId: item.assetId,
      name: item.name,
      symbol: item.symbol,
      decimals: item.decimals,
      icon: asset?.Icon || undefined,
      price: item.price,
      change24h: item.change24h
    };
  });
}

export function useNativeToken(network: string): AssetInfo<true> | undefined {
  const { allApis } = useApi();
  const api = allApis[network];

  if (api && api.isApiReady) {
    const symbol = api.api.registry.chainTokens[0].toString();
    const decimals = api.api.registry.chainDecimals[0];

    return {
      network: network,
      name: symbol,
      symbol: symbol,
      decimals: decimals,
      icon: api.chain.tokenIcon,
      isNative: true,
      assetId: 'native',
      price: 0,
      change24h: 0
    };
  }

  return undefined;
}

export const queryAssetsKey = (network: string) => ['query-assets', network];

export function useAssets(
  network: string
): [data: AssetInfo[] | undefined, isFetched: boolean, isFetching: boolean, promise: Promise<AssetInfo[]>] {
  const { data, isFetched, isFetching, promise } = useQuery({
    queryKey: queryAssetsKey(network),
    queryFn: (): Promise<AssetInfo[]> => service.asset.getAllAssets(network),
    refetchInterval: 60 * 10 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  const transformedData = useMemo(
    () =>
      data?.map((item) => ({
        ...item,
        icon: findAsset(network, item.assetId)?.Icon,
        isNative: false as const,
        network: network
      })),
    [data, network]
  );

  return [transformedData, isFetched, isFetching, promise];
}

export const queryAssetsByAddressKey = (address: string) => ['query-assets-by-address', address];

export function useAssetsByAddress(
  network: string,
  address?: string | null
): [data: AssetInfo[] | undefined, isFetched: boolean, isFetching: boolean] {
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const { data, isFetched, isFetching } = useQuery({
    queryKey: [...queryAssetsByAddressKey(addressHex), network] as const,
    queryFn: (): Promise<AssetInfo[]> => service.asset.getAssetsByAddress(network, addressHex),
    refetchInterval: 60 * 10 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!addressHex,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [useMemo(() => (data ? _extraAsset(network, data) : undefined), [data, network]), isFetched, isFetching];
}

export const queryAssetsAllKey = () => ['query-assets-all'];

export function useAssetsAll(): [
  data: Record<string, AssetInfo[]> | undefined,
  isFetched: boolean,
  isFetching: boolean
] {
  const { data, isFetched, isFetching } = useQuery<Record<string, AssetInfo[]>>({
    queryKey: queryAssetsAllKey(),
    queryFn: (): Promise<Record<string, AssetInfo[]>> => service.asset.getAssetsAll(),
    refetchInterval: 60 * 10 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [
    useMemo(
      () =>
        data
          ? Object.fromEntries(Object.entries(data).map(([network, assets]) => [network, _extraAsset(network, assets)]))
          : undefined,
      [data]
    ),
    isFetched,
    isFetching
  ];
}

export const queryAssetsAllByAddressKey = (address: string) => ['query-assets-all-by-address', address];

export function useAssetsByAddressAll(
  address?: string | null
): [data: Record<string, AssetInfo[]> | undefined, isFetched: boolean, isFetching: boolean] {
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const { data, isFetched, isFetching } = useQuery({
    queryKey: queryAssetsAllByAddressKey(addressHex),
    queryFn: (): Promise<Record<string, AssetInfo[]>> => service.asset.getAssetsByAddressAll(addressHex),
    enabled: !!addressHex,
    refetchInterval: 60 * 10 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [
    useMemo(
      () =>
        data
          ? Object.fromEntries(Object.entries(data).map(([network, assets]) => [network, _extraAsset(network, assets)]))
          : undefined,
      [data]
    ),
    isFetched,
    isFetching
  ];
}

async function fetchAssetInfo({
  queryKey
}: {
  queryKey: [api: ApiPromise, assetId: string, network: string];
}): Promise<[AssetInfo<false>, BN] | undefined> {
  const [api, assetId, network] = queryKey;

  if (api.query.assets) {
    return Promise.all(
      isHex(assetId)
        ? [
            api.query.foreignAssets.metadata<PalletAssetsAssetMetadata>(assetId),
            api.query.foreignAssets.asset<Option<PalletAssetsAssetDetails>>(assetId)
          ]
        : [api.query.assets.metadata(assetId), api.query.assets.asset(assetId)]
    ).then(([metadata, asset]) => {
      return [
        {
          network: network,
          genesisHash: api.genesisHash.toHex(),
          isNative: false,
          assetId: assetId.toString(),
          name: metadata.name.toUtf8(),
          symbol: metadata.symbol.toUtf8(),
          decimals: metadata.decimals.toNumber(),
          existentialDeposit: metadata.deposit.toBigInt(),
          icon: findAsset(network, assetId)?.Icon,
          price: 0,
          change24h: 0
        },
        asset.unwrapOrDefault().minBalance
      ];
    });
  }

  if (api.query.assetRegistry?.assets) {
    return api.query.assetRegistry.assets(assetId).then((metadata) => {
      if ((metadata as Option<PalletAssetRegistryAssetDetails>).isSome) {
        const { name, symbol, decimals, existentialDeposit } = (
          metadata as Option<PalletAssetRegistryAssetDetails>
        ).unwrap();

        return [
          {
            network: network,
            genesisHash: api.genesisHash.toHex(),
            isNative: false,
            assetId: assetId.toString(),
            name: name.unwrapOrDefault().toUtf8(),
            symbol: symbol.unwrapOrDefault().toUtf8(),
            decimals: decimals.unwrapOrDefault().toNumber(),
            icon: findAsset(network, assetId)?.Icon,
            price: 0,
            change24h: 0
          },
          existentialDeposit
        ];
      }

      throw new Error(`Asset not found ${assetId}`);
    });
  }

  if (api.query.assetRegistry?.currencyMetadatas) {
    return await api.query.assetRegistry.currencyMetadatas(assetId).then((metadata) => {
      if ((metadata as Option<AssetMetadata>).isSome) {
        const { name, symbol, decimals, minimalBalance } = (metadata as Option<AssetMetadata>).unwrap();

        return [
          {
            network: network,
            genesisHash: api.genesisHash.toHex(),
            isNative: false,
            assetId: assetId.toString(),
            name: name.toUtf8(),
            symbol: symbol.toUtf8(),
            decimals: decimals.toNumber(),
            icon: findAsset(network, assetId)?.Icon,
            price: 0,
            change24h: 0
          },
          minimalBalance
        ];
      }

      throw new Error(`Asset not found ${assetId}`);
    });
  }

  if (api.query.assetRegistry?.assetMetadatas) {
    return api.query.assetRegistry.assetMetadatas(assetId).then((metadata) => {
      if ((metadata as Option<AssetMetadata>).isSome) {
        const { name, symbol, decimals, minimalBalance } = (metadata as Option<AssetMetadata>).unwrap();

        return [
          {
            network: network,
            genesisHash: api.genesisHash.toHex(),
            isNative: false,
            assetId: assetId.toString(),
            name: name.toUtf8(),
            symbol: symbol.toUtf8(),
            decimals: decimals.toNumber(),
            icon: findAsset(network, assetId)?.Icon,
            price: 0,
            change24h: 0
          },
          minimalBalance
        ];
      }

      throw new Error(`Asset not found ${assetId}`);
    });
  }

  throw new Error(`Asset not found ${assetId}`);
}

export const queryAssetInfoKey = (network: string) => ['query-asset-info', network];

export function useAssetInfo(network: string, assetId?: string | null): [AssetInfo<false> | undefined, BN] {
  const { allApis } = useApi();
  const api: ValidApiState | undefined = allApis[network];
  const { data } = useQuery({
    queryKey: [...queryAssetInfoKey(network), assetId || ''] as const,
    queryFn: async () => {
      if (!api?.api || !assetId) {
        throw new Error('api,assets are required');
      }

      return fetchAssetInfo({ queryKey: [api.api, assetId, network] });
    },
    refetchInterval: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!api && !!api.isApiReady && !!assetId
  });

  return [data?.[0], data?.[1] ?? BN_ZERO];
}

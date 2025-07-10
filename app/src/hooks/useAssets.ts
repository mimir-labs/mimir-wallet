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

export function useAssets(network: string): [data: AssetInfo[] | undefined, isFetched: boolean, isFetching: boolean] {
  const { data, isFetched, isFetching } = useQuery<AssetInfo[]>({
    queryHash: service.getClientUrl(`chains/${network}/all-assets`),
    queryKey: [service.getClientUrl(`chains/${network}/all-assets`)],
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
        data?.map((item) => ({
          ...item,
          icon: findAsset(network, item.assetId)?.Icon,
          isNative: false,
          network: network
        })),
      [data, network]
    ),
    isFetched,
    isFetching
  ];
}

export function useAssetsByAddress(
  network: string,
  address?: string | null
): [data: AssetInfo[] | undefined, isFetched: boolean, isFetching: boolean] {
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const { data, isFetched, isFetching } = useQuery<AssetInfo[] | undefined>({
    queryHash: service.getClientUrl(`chains/${network}/balances/${addressHex}`),
    queryKey: addressHex ? [service.getClientUrl(`chains/${network}/balances/${addressHex}`)] : [null],
    refetchInterval: 60 * 10 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [useMemo(() => (data ? _extraAsset(network, data) : undefined), [data, network]), isFetched, isFetching];
}

export function useAssetsAll(): [
  data: Record<string, AssetInfo[]> | undefined,
  isFetched: boolean,
  isFetching: boolean
] {
  const { data, isFetched, isFetching } = useQuery<Record<string, AssetInfo[]>>({
    queryKey: [service.getClientUrl(`assets/all`)],
    queryHash: service.getClientUrl(`assets/all`),
    refetchInterval: 60 * 10 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next): Record<string, AssetInfo[]> | undefined => {
      if (!next) {
        return undefined;
      }

      const nextData = Object.fromEntries(
        Object.entries(next).map(([network, assets]) => [network, _extraAsset(network, assets)])
      );

      return isEqual(prev, nextData) ? (prev as Record<string, AssetInfo[]>) : nextData;
    }
  });

  return [data, isFetched, isFetching];
}

export function useAssetsByAddressAll(
  address?: string | null
): [data: Record<string, AssetInfo[]> | undefined, isFetched: boolean, isFetching: boolean] {
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const { data, isFetched, isFetching } = useQuery<Record<string, AssetInfo[]>>({
    queryKey: addressHex ? [service.getClientUrl(`balances/all/${addressHex}`)] : [null],
    queryHash: service.getClientUrl(`balances/all/${addressHex}`),
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
  queryKey: [api: ApiPromise, assetId: string | undefined | null, network: string];
}): Promise<[AssetInfo<false>, BN] | undefined> {
  const [api, assetId, network] = queryKey;

  if (!assetId) {
    return Promise.resolve(undefined);
  }

  if (api.query.assets) {
    if (isHex(assetId) && !api.query.foreignAssets) {
      return Promise.resolve(undefined);
    }

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

        if (name.isSome && symbol.isSome && decimals.isSome) {
          return [
            {
              network: network,
              genesisHash: api.genesisHash.toHex(),
              isNative: false,
              assetId: assetId.toString(),
              name: name.unwrap().toUtf8(),
              symbol: symbol.unwrap().toUtf8(),
              decimals: decimals.unwrap().toNumber(),
              icon: findAsset(network, assetId)?.Icon,
              price: 0,
              change24h: 0
            },
            existentialDeposit
          ];
        }
      }

      return undefined;
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

      return undefined;
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

      return undefined;
    });
  }

  return Promise.resolve(undefined);
}

export function useAssetInfo(network: string, assetId?: string | null): [AssetInfo<false> | undefined, BN] {
  const { allApis } = useApi();
  const api: ValidApiState | undefined = allApis[network];
  const queryHash = `${network}-asset-info-${assetId}`;
  const { data } = useQuery({
    queryKey: [api?.api, assetId, network] as const,
    queryHash,
    queryFn: fetchAssetInfo,
    refetchInterval: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!api && api.isApiReady && !!assetId
  });

  return [data?.[0], data?.[1] ?? BN_ZERO];
}

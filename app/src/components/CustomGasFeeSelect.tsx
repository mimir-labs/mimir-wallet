// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetInfo } from '@/hooks/types';

import { FormatBalance } from '@/components';
import { useAssetBalance, useNativeBalances } from '@/hooks/useBalances';
import { useCustomGasFee } from '@/hooks/useCustomGasFee';
import React, { useEffect, useMemo } from 'react';

import { Avatar, Select, SelectItem, Skeleton } from '@mimir-wallet/ui';

interface CustomGasFeeSelectProps {
  network: string;
  address?: string;
  label?: string;
  placeholder?: string;
  onChange?: (asset: AssetInfo | null) => void;
  isDisabled?: boolean;
  className?: string;
  /** Gas fee information to display */
  gasFeeInfo?: GasFeeInfo | null;
}

/**
 * Gas fee information for a specific asset
 */
export interface GasFeeInfo {
  /** Required amount in the asset's units */
  amount: bigint;
  /** Asset symbol */
  symbol: string;
  /** Asset decimals for formatting */
  decimals: number;
}

function AssetBalance({ asset, address }: { asset: AssetInfo; address: string | undefined }) {
  const [assetBalance, isAssetFetched, isAssetFetching] = useAssetBalance(
    asset.network,
    address,
    asset.isNative ? undefined : asset.assetId
  );
  const [nativeBalance, isNativeFetched, isNativeFetching] = useNativeBalances(address);

  const balance = asset.isNative ? nativeBalance?.transferrable : assetBalance?.transferrable;
  const isFetching = asset.isNative ? isNativeFetching : isAssetFetching;
  const isFetched = asset.isNative ? isNativeFetched : isAssetFetched;

  if (isFetching && !isFetched) {
    return <Skeleton className='h-[16px] w-16' />;
  }

  return (
    <span>
      <FormatBalance value={balance} withCurrency format={[asset.decimals, asset.symbol]} />
    </span>
  );
}

function CustomGasFeeSelect({
  network,
  address,
  label = 'Select an asset as fee',
  placeholder = 'Plaese select an asset',
  onChange,
  isDisabled,
  className = '',
  gasFeeInfo
}: CustomGasFeeSelectProps) {
  const { isSupported, feeEligibleAssets, selectedAsset, selectedAssetId, setSelectedAssetId, isFetched, isFetching } =
    useCustomGasFee(network);

  const asset = useMemo(() => {
    return (
      feeEligibleAssets.find((item) =>
        item.isNative ? 'native' === selectedAssetId : item.assetId === selectedAssetId
      ) || null
    );
  }, [feeEligibleAssets, selectedAssetId]);

  useEffect(() => {
    onChange?.(asset);
  }, [asset, onChange]);

  // Don't render if chain doesn't support custom fees
  if (!isSupported) {
    return null;
  }

  if (isFetching && !isFetched) {
    return (
      <div className={className}>
        <div className='flex flex-col gap-2'>
          <label className='text-small font-medium'>{label}</label>
          <Skeleton className='h-14 w-full rounded-medium' />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Select
        label={label}
        placeholder={placeholder}
        selectedKeys={selectedAssetId ? [selectedAssetId] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0];

          if (value) {
            setSelectedAssetId(value.toString());
          }
        }}
        isDisabled={isDisabled || feeEligibleAssets.length === 0}
        variant='bordered'
        labelPlacement='outside'
        renderValue={(items) => {
          const item = items[0];

          if (!item || !selectedAsset) {
            return <span className='text-foreground/50'>{placeholder}</span>;
          }

          return (
            <div className='flex items-center justify-between w-full'>
              <div className='flex items-center gap-3'>
                <Avatar
                  alt={selectedAsset.symbol}
                  fallback={selectedAsset.symbol.slice(0, 1)}
                  src={selectedAsset.icon}
                  style={{ width: 22, height: 22 }}
                />
                <span className='text-small font-medium'>{selectedAsset.symbol}</span>
                <span className='text-tiny text-foreground/50'>{selectedAsset.assetId}</span>
              </div>
              <AssetBalance asset={selectedAsset} address={address} />
            </div>
          );
        }}
      >
        {feeEligibleAssets.map((asset) => (
          <SelectItem
            key={asset.assetId}
            selectedIcon={<span />}
            endContent={<AssetBalance asset={asset} address={address} />}
            textValue={asset.symbol}
            color='secondary'
          >
            <div className='flex items-center gap-3 w-full'>
              <Avatar
                alt={asset.symbol}
                fallback={asset.symbol.slice(0, 1)}
                src={asset.icon}
                style={{ width: 22, height: 22 }}
              />
              <span className='text-small font-medium'>{asset.symbol}</span>
              <span className='text-tiny text-foreground/50'>{asset.assetId}</span>
            </div>
          </SelectItem>
        ))}
      </Select>

      {gasFeeInfo ? (
        <div className='text-right text-small text-foreground leading-[20px] mt-[5px]'>
          <b>Required: </b>
          <span>
            <FormatBalance value={gasFeeInfo.amount} withCurrency format={[gasFeeInfo.decimals, gasFeeInfo.symbol]} />
          </span>
        </div>
      ) : (
        <Skeleton className='h-[16px] w-16 ml-auto mt-[5px]' />
      )}
    </div>
  );
}

export default React.memo(CustomGasFeeSelect);

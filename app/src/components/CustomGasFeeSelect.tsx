// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';

import { FormatBalance } from '@/components';
import { useBalanceByIdentifier } from '@/hooks/useChainBalances';
import { useCustomGasFee } from '@/hooks/useCustomGasFee';
import React, { useEffect, useMemo } from 'react';

import { Avatar, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from '@mimir-wallet/ui';

interface CustomGasFeeSelectProps {
  network: string;
  address?: string;
  label?: string;
  placeholder?: string;
  onChange?: (asset: CompleteEnhancedAssetInfo | null) => void;
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

function AssetBalance({
  asset,
  address,
  network
}: {
  asset: CompleteEnhancedAssetInfo;
  address: string | undefined;
  network: string;
}) {
  const [balanceData, isFetched, isFetching] = useBalanceByIdentifier(
    network,
    address,
    asset.isNative ? 'native' : asset.assetId || ''
  );

  const balance = balanceData?.transferrable;

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
  const { isSupported, feeEligibleAssets, selectedAssetId, setSelectedAssetId, isFetched, isFetching } =
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
          <label className='text-sm font-medium'>{label}</label>
          <Skeleton className='h-14 w-full rounded-[10px]' />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className='flex flex-col gap-2'>
        <label className='text-sm font-medium'>{label}</label>
        <Select
          value={selectedAssetId || ''}
          onValueChange={(value) => {
            setSelectedAssetId(value);
          }}
          disabled={isDisabled || feeEligibleAssets.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {feeEligibleAssets.map((asset) => (
              <SelectItem
                key={asset.assetId || 'native'}
                value={asset.assetId || 'native'}
                className='w-full pr-2.5 *:[span]:first:hidden'
              >
                <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar
                      alt={asset.symbol}
                      fallback={asset.symbol.slice(0, 1)}
                      src={asset.logoUri}
                      style={{ width: 22, height: 22 }}
                    />
                    <span className='text-sm font-medium'>{asset.symbol}</span>
                    <span className='text-foreground/50 text-xs'>{asset.assetId}</span>
                  </div>
                  <AssetBalance asset={asset} address={address} network={network} />
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {gasFeeInfo ? (
        <div className='text-foreground mt-[5px] text-right text-sm leading-[20px]'>
          <b>Required: </b>
          <span>
            <FormatBalance value={gasFeeInfo.amount} withCurrency format={[gasFeeInfo.decimals, gasFeeInfo.symbol]} />
          </span>
        </div>
      ) : (
        <Skeleton className='mt-[5px] ml-auto h-[16px] w-16' />
      )}
    </div>
  );
}

export default React.memo(CustomGasFeeSelect);

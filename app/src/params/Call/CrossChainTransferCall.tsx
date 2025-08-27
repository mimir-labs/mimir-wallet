// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import { Address, AddressName, AddressRow, CopyAddress, FormatBalance, IdentityIcon } from '@/components';
import { findAsset } from '@/config';
import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';
import {
  type AssetTransfer,
  type CrossChainTransferInfo,
  useParseCrossChainTransfer
} from '@/hooks/useParseCrossChainTransfer';
import { useXcmAsset } from '@/hooks/useXcmAssets';
import React, { forwardRef } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, cn, Popover, PopoverContent, PopoverTrigger, Skeleton, TextEllipsis, Tooltip } from '@mimir-wallet/ui';

import FunctionArgs from './FunctionArgs';
import { mergeClasses } from './utils';

const AddressDisplay = React.memo(({ reverse, address }: { reverse: boolean; address?: string | null }) => {
  const copyAddress = useCopyAddressToClipboard(address || '');

  return (
    <div>
      <div
        data-reverse={reverse}
        className={cn(
          'group address-cell inline-flex flex-grow-0 items-center gap-x-2',
          'data-[reverse=true]:flex-row-reverse data-[reverse=true]:text-right @max-lg:hidden'
        )}
        onClick={
          address
            ? (e) => {
                e.stopPropagation();
                copyAddress();
              }
            : undefined
        }
      >
        <IdentityIcon size={24} value={address} />
        <div className='flex flex-col'>
          <div className='inline-flex h-[16px] max-h-[16px] items-center gap-1 truncate leading-[16px] font-bold group-data-[reverse=true]:flex-row-reverse sm:text-sm'>
            <TextEllipsis maxWidth={120}>
              <AddressName value={address} />
            </TextEllipsis>
            {address && <CopyAddress address={address} size='sm' />}
          </div>
          <div className='text-foreground/50 text-xs leading-[12px]'>
            <Address shorten value={address} />
          </div>
        </div>
      </div>

      <AddressRow
        className='[&_.AddressRow-Address]:text-foreground/50 hidden @max-lg:flex'
        iconSize={24}
        shorten
        withName
        withAddress
        withCopy
        value={address}
      />
    </div>
  );
});

const ChainIcon = React.memo(
  ({ chainInfo, side }: { chainInfo: CrossChainTransferInfo['destination']; side: 'left' | 'right' }) => {
    const className = `h-6 w-6 @max-lg:h-5 @max-lg:w-5 cursor-help ${side === 'left' ? 'mr-2.5' : 'ml-2.5'}`;

    if (!chainInfo.isSupport) {
      return (
        <Tooltip content={`ParaId: ${chainInfo.paraId}`}>
          <Avatar className={className} />
        </Tooltip>
      );
    }

    const { name, icon } = chainInfo;

    return (
      <Tooltip content={name}>
        <Avatar className={className} src={icon} fallback={name} />
      </Tooltip>
    );
  }
);

function AmountDisplay({ asset }: { asset: AssetTransfer }) {
  const [data, isFetched, isFetching] = useXcmAsset(
    asset.chain.isSupport ? asset.chain.key : '',
    asset.isNative ? 'native' : asset.assetKey || asset.assetId
  );

  if (!asset.chain.isSupport) {
    return `NotSupport:${asset.chain.paraId}`;
  }

  if (!data || (!isFetched && isFetching)) {
    return <Skeleton style={{ width: 50, height: 12 }} />;
  }

  const icon = !data.isNative
    ? findAsset(asset.chain.key, data.assetId || '')?.Icon ||
      findAsset(asset.chain.key, data.key || '')?.Icon ||
      undefined
    : asset.chain.tokenIcon;

  return (
    <FormatBalance
      icon={<Avatar className='h-4 w-4 bg-transparent' src={icon} />}
      value={asset.amount}
      withCurrency
      format={[data.decimals, data.symbol]}
    />
  );
}

const CrossChainTransferCall = forwardRef<HTMLDivElement | null, CallProps>((props, ref) => {
  const {
    from: propFrom,
    registry,
    call,
    className,
    showFallback,
    fallbackComponent: FallbackComponent = FunctionArgs
  } = props;
  const { chain } = useApi();
  const results = useParseCrossChainTransfer(registry, chain, call);
  const [open, toggleOpen] = useToggle(false);
  const asset0 = results?.assets.at(0);

  if (!results) {
    return showFallback ? <FallbackComponent ref={ref} {...props} /> : null;
  }

  const { assets, beneficiary } = results;

  const hasMultipleAssets = assets.length > 1;

  return (
    <div
      ref={ref}
      className={mergeClasses(
        'relative flex w-full flex-row items-center justify-between gap-7 @max-lg:flex-col @max-lg:items-start @max-lg:gap-2.5 @max-lg:pl-5',
        className
      )}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='6'
        height='101'
        viewBox='0 0 6 101'
        fill='none'
        className='absolute top-0 bottom-0 left-0 hidden h-full @max-lg:block'
      >
        <path
          opacity='0.5'
          d='M3 0.333333C1.52724 0.333333 0.333333 1.52724 0.333333 3C0.333333 4.47276 1.52724 5.66667 3 5.66667C4.47276 5.66667 5.66667 4.47276 5.66667 3C5.66667 1.52724 4.47276 0.333333 3 0.333333ZM3 101L5.88675 96L0.113245 96L3 101ZM3 3L2.5 3L2.5 3.98L3 3.98L3.5 3.98L3.5 3L3 3ZM3 5.94L2.5 5.94L2.5 7.9L3 7.9L3.5 7.9L3.5 5.94L3 5.94ZM3 9.86L2.5 9.86L2.5 11.82L3 11.82L3.5 11.82L3.5 9.86L3 9.86ZM3 13.78L2.5 13.78L2.5 15.74L3 15.74L3.5 15.74L3.5 13.78L3 13.78ZM3 17.7L2.5 17.7L2.5 19.66L3 19.66L3.5 19.66L3.5 17.7L3 17.7ZM3 21.62L2.5 21.62L2.5 23.58L3 23.58L3.5 23.58L3.5 21.62L3 21.62ZM3 25.54L2.5 25.54L2.5 27.5L3 27.5L3.5 27.5L3.5 25.54L3 25.54ZM3 29.46L2.5 29.46L2.5 31.42L3 31.42L3.5 31.42L3.5 29.46L3 29.46ZM3 33.38L2.5 33.38L2.5 35.34L3 35.34L3.5 35.34L3.5 33.38L3 33.38ZM3 37.3L2.5 37.3L2.5 39.26L3 39.26L3.5 39.26L3.5 37.3L3 37.3ZM3 41.22L2.5 41.22L2.5 43.18L3 43.18L3.5 43.18L3.5 41.22L3 41.22ZM3 45.14L2.5 45.14L2.5 47.1L3 47.1L3.5 47.1L3.5 45.14L3 45.14ZM3 49.06L2.5 49.06L2.5 51.02L3 51.02L3.5 51.02L3.5 49.06L3 49.06ZM3 52.98L2.5 52.98L2.5 54.94L3 54.94L3.5 54.94L3.5 52.98L3 52.98ZM3 56.9L2.5 56.9L2.5 58.86L3 58.86L3.5 58.86L3.5 56.9L3 56.9ZM3 60.82L2.5 60.82L2.5 62.78L3 62.78L3.5 62.78L3.5 60.82L3 60.82ZM3 64.74L2.5 64.74L2.5 66.7L3 66.7L3.5 66.7L3.5 64.74L3 64.74ZM3 68.66L2.5 68.66L2.5 70.62L3 70.62L3.5 70.62L3.5 68.66L3 68.66ZM3 72.58L2.5 72.58L2.5 74.54L3 74.54L3.5 74.54L3.5 72.58L3 72.58ZM3 76.5L2.5 76.5L2.5 78.46L3 78.46L3.5 78.46L3.5 76.5L3 76.5ZM3 80.42L2.5 80.42L2.5 82.38L3 82.38L3.5 82.38L3.5 80.42L3 80.42ZM3 84.34L2.5 84.34L2.5 86.3L3 86.3L3.5 86.3L3.5 84.34L3 84.34ZM3 88.26L2.5 88.26L2.5 90.22L3 90.22L3.5 90.22L3.5 88.26L3 88.26ZM3 92.18L2.5 92.18L2.5 94.14L3 94.14L3.5 94.14L3.5 92.18L3 92.18ZM3 96.1L2.5 96.1L2.5 98.06L3 98.06L3.5 98.06L3.5 96.1L3 96.1Z'
          fill='#151F34'
        />
      </svg>
      <AddressDisplay reverse={false} address={propFrom} />
      <div className='text-foreground/50 relative flex flex-1 items-center @max-lg:w-full'>
        <ChainIcon chainInfo={{ isSupport: true, ...chain }} side='left' />
        <div className='bg-foreground/50 h-1.5 w-1.5 rounded-[3px] @max-lg:hidden' />
        <div className='border-foreground/50 flex-1 border-t-1 border-dashed @max-lg:hidden' />
        <svg
          width='6'
          height='8'
          xmlns='http://www.w3.org/2000/svg'
          style={{ color: 'inherit' }}
          className='@max-lg:hidden'
        >
          <polygon points='0,0 6,4 0,8' fill='currentColor' />
        </svg>
        <Popover onOpenChange={hasMultipleAssets ? toggleOpen : undefined} open={open}>
          <PopoverTrigger asChild>
            <div
              data-multi-assets={hasMultipleAssets}
              className={cn(
                'border-primary/5 bg-secondary text-foreground flex items-center gap-1 rounded-full border-1 px-3 py-1 text-sm leading-[1] font-bold data-[multi-assets=true]:cursor-pointer',
                'absolute top-1/2 left-1/2 -translate-1/2 @max-lg:static @max-lg:translate-0'
              )}
            >
              {hasMultipleAssets ? <span>Multi-Asset</span> : asset0 ? <AmountDisplay asset={asset0} /> : 'None'}
            </div>
          </PopoverTrigger>
          <PopoverContent className='flex flex-col gap-2.5'>
            <h6>Asset List</h6>
            {results.assets.map((asset, index) => (
              <div key={index} className='border-divider-300 rounded-[10px] border-1 px-5 py-2.5 text-center'>
                <AmountDisplay asset={asset} key={index} />
              </div>
            ))}
          </PopoverContent>
        </Popover>
        <ChainIcon chainInfo={results.destination} side='right' />
      </div>
      <AddressDisplay reverse address={beneficiary} />
    </div>
  );
});

CrossChainTransferCall.displayName = 'CrossChainTransferCall';

export default React.memo(CrossChainTransferCall);

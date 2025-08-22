// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import { Address, AddressName, CopyAddress, FormatBalance, IdentityIcon } from '@/components';
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
import { Avatar, Popover, PopoverContent, PopoverTrigger, Skeleton, TextEllipsis, Tooltip } from '@mimir-wallet/ui';

import FunctionArgs from './FunctionArgs';
import { mergeClasses } from './utils';

const AddressDisplay = React.memo(({ reverse, address }: { reverse: boolean; address?: string | null }) => {
  const copyAddress = useCopyAddressToClipboard(address || '');

  return (
    <div
      data-reverse={reverse}
      className='group address-cell inline-flex flex-grow-0 items-center gap-x-1 data-[reverse=true]:flex-row-reverse data-[reverse=true]:text-right sm:gap-x-2.5'
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
  );
});

const ChainIcon = React.memo(
  ({ chainInfo, side }: { chainInfo: CrossChainTransferInfo['destination']; side: 'left' | 'right' }) => {
    const className = `h-6 w-6 cursor-help ${side === 'left' ? 'mr-2' : 'ml-2'}`;

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
    <div ref={ref} className={mergeClasses('flex w-full flex-col gap-2', className)}>
      <div className='flex w-full items-center justify-between gap-2.5 sm:gap-5 md:gap-7'>
        <AddressDisplay reverse={false} address={propFrom} />
        <div className='text-foreground/50 relative flex flex-1 items-center'>
          <ChainIcon chainInfo={{ isSupport: true, ...chain }} side='left' />
          <div className='bg-foreground/50 h-1.5 w-1.5 rounded-[3px]' />
          <div className='border-foreground/50 flex-1 border-t-1 border-dashed' />
          <svg width='6' height='8' xmlns='http://www.w3.org/2000/svg' style={{ color: 'inherit' }}>
            <polygon points='0,0 6,4 0,8' fill='currentColor' />
          </svg>
          <ChainIcon chainInfo={results.destination} side='right' />
          <Popover onOpenChange={hasMultipleAssets ? toggleOpen : undefined} open={open}>
            <PopoverTrigger asChild>
              <div
                data-multi-assets={hasMultipleAssets}
                className='border-primary/5 bg-secondary text-foreground absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border-1 px-3 py-1 text-sm leading-[1] font-bold data-[multi-assets=true]:cursor-pointer'
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
        </div>
        <AddressDisplay reverse address={beneficiary} />
      </div>
    </div>
  );
});

CrossChainTransferCall.displayName = 'CrossChainTransferCall';

export default React.memo(CrossChainTransferCall);

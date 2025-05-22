// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from '../types';

import { Address, AddressName, CopyAddress, FormatBalance, IdentityIcon } from '@/components';
import { useAssetInfo } from '@/hooks/useAssets';
import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';
import { useParseTransfer } from '@/hooks/useParseTransfer';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Skeleton, usePress } from '@mimir-wallet/ui';

import FunctionArgs from './FunctionArgs';

function AddressDisplay({ reverse, address }: { reverse: boolean; address?: string }) {
  const copyAddress = useCopyAddressToClipboard(address);
  const { pressProps } = usePress({
    onPress: address
      ? () => {
          copyAddress();
        }
      : undefined
  });

  return (
    <div
      data-reverse={reverse}
      className='group address-cell inline-flex items-center sm:gap-x-2.5 gap-x-1 flex-grow-0 data-[reverse=true]:flex-row-reverse data-[reverse=true]:text-right'
      {...pressProps}
    >
      <IdentityIcon size={24} value={address} />
      <div className='flex flex-col'>
        <div className='inline-flex items-center font-bold sm:text-sm leading-[16px] h-[16px] max-h-[16px] truncate max-w-[120px] gap-1 group-data-[reverse=true]:flex-row-reverse'>
          <AddressName value={address} />
          {address && <CopyAddress address={address} size='sm' color='default' />}
        </div>
        <div className='text-foreground/50 text-tiny leading-[12px]'>
          <Address shorten value={address} />
        </div>
      </div>
    </div>
  );
}

function TransferCall({ from: propFrom, registry, call, jsonFallback }: CallProps) {
  const { network } = useApi();
  const results = useParseTransfer(registry, propFrom, call);

  const [assetInfo] = useAssetInfo(network, results?.[0]);

  if (!results) return <FunctionArgs from={propFrom} registry={registry} call={call} jsonFallback={jsonFallback} />;

  const [assetId, from, to, value, isAll] = results;

  return (
    <div className='w-full flex items-center justify-between gap-2.5 sm:gap-5 md:gap-7'>
      <AddressDisplay reverse={false} address={from} />
      <div className='relative flex-1 flex items-center text-foreground/50'>
        <div className='w-1.5 h-1.5 rounded-[3px] bg-foreground/50' />
        <div className='flex-1 border-t-1 border-dashed border-foreground/50' />
        <svg width='6' height='8' xmlns='http://www.w3.org/2000/svg' style={{ color: 'inherit' }}>
          <polygon points='0,0 6,4 0,8' fill='currentColor' />
        </svg>
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full border-1 border-primary/5 bg-secondary px-3 py-1 text-foreground text-small font-bold leading-[1]'>
          {assetId !== null ? (
            assetInfo ? (
              isAll ? (
                `All ${assetInfo.symbol}`
              ) : (
                <FormatBalance value={value} withCurrency format={[assetInfo.decimals, assetInfo.symbol]} />
              )
            ) : (
              <Skeleton style={{ width: 50 }} />
            )
          ) : isAll ? (
            'All'
          ) : (
            <FormatBalance value={value} withCurrency />
          )}
        </div>
      </div>
      <AddressDisplay reverse address={to} />
    </div>
  );
}

export default React.memo(TransferCall);

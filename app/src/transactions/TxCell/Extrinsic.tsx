// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';

import { chainLinks, encodeAddress, useNetwork } from '@mimir-wallet/polkadot-core';
import { Button, cn, Divider, Skeleton } from '@mimir-wallet/ui';
import moment from 'moment';
import React from 'react';

import Target from './Target';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconLink from '@/assets/svg/icon-link.svg?react';
import IconShare from '@/assets/svg/icon-share.svg?react';
import { AppName, Bytes, Hash } from '@/components';
import { events } from '@/events';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { useParseCallWithFallback } from '@/hooks/useParseCall';
import { useTransactionDetail } from '@/hooks/useTransactions';

export function Item({ content, title }: { title?: React.ReactNode; content?: React.ReactNode }) {
  return (
    <div className='grid w-full grid-cols-10 gap-2.5 text-xs'>
      <div className='col-span-2 flex items-center font-bold'>{title}</div>
      <div className='text-foreground/65 col-span-8 flex items-center font-bold'>{content}</div>
    </div>
  );
}

function Extrinsic({
  isMobile = false,
  transaction,
  call,
  hasLargeCalls = false,
  shouldLoadDetails = false,
  onLoadDetails
}: {
  isMobile?: boolean;
  defaultOpen?: boolean;
  transaction: Transaction;
  call?: IMethod | null;
  hasLargeCalls?: boolean;
  shouldLoadDetails?: boolean;
  onLoadDetails?: () => void;
}) {
  const { network, chain } = useNetwork();
  const [isCopied, copy] = useCopyClipboard();

  // Get the loading state for the button
  const [, isFetched, isFetching] = useTransactionDetail(
    network,
    shouldLoadDetails ? transaction.id.toString() : undefined
  );

  // Parse call data using the async hook
  const { call: parsedCall, isLoading: isParsingCall } = useParseCallWithFallback(network, transaction.call, call);

  if (isParsingCall) {
    return (
      <div className='flex flex-1 flex-col gap-2.5'>
        {/* Call component skeleton */}
        <div className='bg-secondary flex flex-col gap-2.5 rounded-[10px] p-2.5'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>

        <Divider />

        {/* CallInfo skeleton - action name + buttons */}
        <div className='flex w-full flex-col gap-[5px]'>
          <div className='flex w-full items-center justify-start gap-2.5'>
            <Skeleton className='h-5 w-32' />
            <div className='flex-1' />
            <Skeleton className='h-8 w-24 rounded-md' />
            <Skeleton className='h-8 w-20 rounded-md' />
          </div>
          <div className='bg-secondary flex flex-col gap-2.5 rounded-[10px] p-2.5'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        </div>

        <Divider />

        {/* View Details skeleton */}
        <Skeleton className='h-4 w-24' />
      </div>
    );
  }

  return (
    <>
      <div className='@container flex flex-1 flex-col gap-2.5'>
        <>
          <Target isMobile={isMobile} address={transaction.address} call={parsedCall} />

          {hasLargeCalls && (!shouldLoadDetails || (!isFetched && isFetching)) && (
            <div className='flex flex-col gap-[5px]'>
              <p className='font-bold'>Call Data</p>
              <Button
                className='font-bold'
                color='secondary'
                radius='md'
                onClick={onLoadDetails}
                disabled={shouldLoadDetails}
              >
                Load Big Call Data
              </Button>
            </div>
          )}

          <Divider className='first:hidden' />

          <details className='group' open={isMobile}>
            <summary className='hover:text-primary flex cursor-pointer list-none items-center font-bold no-underline transition-colors select-none'>
              <span className='group-open:hidden'>View Details</span>
              <span className='hidden group-open:block'>Hide Details</span>
              <ArrowDown className='transform transition-transform group-open:rotate-180' />
            </summary>

            <div
              data-mobile={isMobile}
              className={cn(
                'border-divider-300 mt-[5px] flex flex-col gap-2.5 rounded-[10px] border-1 p-2.5',
                'data-[mobile=true]:bg-background'
              )}
            >
              <Item title='Call Hash' content={<Hash value={transaction.callHash} withCopy />} />

              {transaction.call && (
                <Item
                  title='Call Data'
                  content={
                    <div className='flex items-center gap-[5px]'>
                      <Bytes value={transaction.call} />
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-5 px-2.5 text-xs'
                        onClick={() => events.emit('call_data_view', network, transaction.call!)}
                      >
                        Verify
                      </Button>
                    </div>
                  }
                />
              )}

              <Item title='TransactionID' content={transaction.id} />

              <Item
                title='App'
                content={
                  <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />
                }
              />
              {transaction.createdExtrinsicHash && (
                <Item
                  title='Created Transaction'
                  content={<Hash value={transaction.createdExtrinsicHash} withCopy withExplorer />}
                />
              )}
              {transaction.executedExtrinsicHash && (
                <Item
                  title='Executed Transaction'
                  content={<Hash value={transaction.executedExtrinsicHash} withCopy withExplorer />}
                />
              )}

              {transaction.note && <Item title='Note' content={transaction.note} />}
              {transaction.createdBlock && <Item title='Created Block' content={transaction.createdBlock} />}
              <Item title='Created Time' content={moment(transaction.createdAt).format()} />
              {transaction.executedBlock && <Item title='Executed Block' content={transaction.executedBlock} />}
              {transaction.cancelBlock && <Item title='Cancel Block' content={transaction.cancelBlock} />}
              {transaction.cancelExtrinsicHash && (
                <Item
                  title='Cancel Transaction'
                  content={<Hash value={transaction.cancelExtrinsicHash} withCopy withExplorer />}
                />
              )}
            </div>
          </details>

          <div className='flex gap-2.5 pt-2.5'>
            <Button asChild variant='ghost'>
              <a
                href={
                  transaction.executedExtrinsicHash
                    ? chainLinks.extrinsicExplorerLink(chain, transaction.executedExtrinsicHash)
                    : chainLinks.extrinsicExplorerLink(chain, transaction.createdExtrinsicHash)
                }
                target='_blank'
                rel='noopener noreferrer'
              >
                <IconLink className='h-4 w-4' />
                View in explorer
              </a>
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                const url = new URL(window.location.href);

                url.searchParams.set('tx_id', transaction.id.toString());

                copy(
                  `${window.location.origin}/transactions/${transaction.id}?network=${network}&address=${encodeAddress(transaction.address, chain.ss58Format)}`
                );
              }}
            >
              <IconShare className='h-4 w-4' />
              {isCopied ? 'Copied' : 'Share'}
            </Button>
          </div>
        </>
      </div>
    </>
  );
}

export default React.memo(Extrinsic);

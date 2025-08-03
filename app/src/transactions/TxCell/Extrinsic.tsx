// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { AppName, Bytes, Hash } from '@/components';
import { events } from '@/events';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { useTransactionDetail } from '@/hooks/useTransactions';
import moment from 'moment';
import React from 'react';

import { chainLinks, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Link } from '@mimir-wallet/ui';

import Target from './Target';

export function Item({ content, title }: { title?: React.ReactNode; content?: React.ReactNode }) {
  return (
    <div className='text-tiny grid w-full grid-cols-10 gap-2.5'>
      <div className='col-span-2 flex items-center font-bold'>{title}</div>
      <div className='text-foreground/65 col-span-8 flex items-center font-bold'>{content}</div>
    </div>
  );
}

function Extrinsic({
  transaction,
  call,
  hasLargeCalls = false,
  shouldLoadDetails = false,
  onLoadDetails
}: {
  defaultOpen?: boolean;
  transaction: Transaction;
  call?: IMethod | null;
  hasLargeCalls?: boolean;
  shouldLoadDetails?: boolean;
  onLoadDetails?: () => void;
}) {
  const { network, chain, chainSS58, api } = useApi();
  const [isCopied, copy] = useCopyClipboard();

  // Get the loading state for the button
  const [, isFetched, isFetching] = useTransactionDetail(
    network,
    shouldLoadDetails ? transaction.id.toString() : undefined
  );

  const displayCall =
    transaction.call && !call
      ? (() => {
          try {
            return api.registry.createTypeUnsafe('Call', [transaction.call]) as IMethod;
          } catch {
            return null;
          }
        })()
      : call;

  return (
    <>
      <div className='flex flex-1 flex-col gap-2.5'>
        <>
          <Target address={transaction.address} call={displayCall} />

          {hasLargeCalls && (!shouldLoadDetails || (!isFetched && isFetching)) && (
            <div className='flex flex-col gap-[5px]'>
              <p className='font-bold'>Call Data</p>
              <Button
                className='font-bold'
                color='secondary'
                radius='md'
                isLoading={isFetching || shouldLoadDetails}
                onPress={onLoadDetails}
                isDisabled={shouldLoadDetails}
              >
                Load Big Call Data
              </Button>
            </div>
          )}

          <Divider className='first:hidden' />

          <details className='group'>
            <summary className='hover:text-primary flex cursor-pointer list-none items-center font-bold no-underline transition-colors select-none'>
              <span className='group-open:hidden'>View Details</span>
              <span className='hidden group-open:block'>Hide Details</span>
              <ArrowDown className='transform transition-transform group-open:rotate-180' />
            </summary>

            <div className='border-divider-300 rounded-medium mt-[5px] flex flex-col gap-2.5 border-1 p-2.5'>
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
                        className='text-tiny h-5 px-2.5'
                        onPress={() => events.emit('call_data_view', network, transaction.call!)}
                      >
                        Verify
                      </Button>
                    </div>
                  }
                />
              )}

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
            <Button
              as={Link}
              variant='ghost'
              isExternal
              href={
                transaction.executedExtrinsicHash
                  ? chainLinks.extrinsicExplorerLink(chain, transaction.executedExtrinsicHash)
                  : chainLinks.extrinsicExplorerLink(chain, transaction.createdExtrinsicHash)
              }
            >
              View in explorer
            </Button>
            <Button
              variant='ghost'
              onPress={() => {
                const url = new URL(window.location.href);

                url.searchParams.set('tx_id', transaction.id.toString());

                copy(
                  `${window.location.origin}/transactions/${transaction.id}?network=${network}&address=${encodeAddress(transaction.address, chainSS58)}`
                );
              }}
            >
              {isCopied ? 'Copied' : 'Share'}
            </Button>
          </div>
        </>
      </div>
    </>
  );
}

export default React.memo(Extrinsic);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import IconShare from '@/assets/svg/icon-share.svg?react';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTransactionDetail } from '@/hooks/useTransactions';
import moment from 'moment';
import React, { useState } from 'react';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Divider, Spinner, Tooltip } from '@mimir-wallet/ui';

import { formatTransactionId } from '../utils';
import TxItems from './TxItems';
import TxItemsSmall from './TxItemsSmall';

interface Props {
  withDetails?: boolean;
  defaultOpen?: boolean;
  address: string;
  transaction: Transaction;
}

function TxCell({ withDetails, defaultOpen, address, transaction: propsTransaction }: Props) {
  const upSm = useMediaQuery('sm');
  const [isCopied, copy] = useCopyClipboard();
  const { network, chain, chainSS58, isApiReady } = useApi();
  const [account] = useQueryAccount(address);

  // State for loading full transaction details
  const [shouldLoadDetails, setShouldLoadDetails] = useState(false);
  const [fullTransaction] = useTransactionDetail(
    network,
    shouldLoadDetails ? propsTransaction.id.toString() : undefined
  );

  // Use full transaction if loaded, otherwise use original
  const transaction = fullTransaction || propsTransaction;
  const { status } = transaction;

  // Check if transaction has large calls
  const hasLargeCalls = !!transaction.isLargeCall;

  return (
    <div className='rounded-large bg-content1 border-secondary shadow-small space-y-3 border-1 p-3 sm:p-4'>
      <div className='flex flex-1 items-center justify-between gap-2.5'>
        <div className='flex flex-1 items-center gap-2.5'>
          <div
            data-pending={status < TransactionStatus.Success}
            data-success={status === TransactionStatus.Success}
            data-failed={status > TransactionStatus.Success}
            className='rounded-medium data-[pending=true]:bg-warning data-[success=true]:bg-success data-[failed=true]:bg-danger h-2 w-2'
          />
          <Avatar src={chain.icon} className='h-5 w-5 bg-transparent' />
          {transaction.type === TransactionType.Propose ? (
            <h4 className='text-primary'>Propose {transaction.id}</h4>
          ) : (
            <h4 className='text-primary'>No {formatTransactionId(transaction.id)}</h4>
          )}
        </div>

        <p>
          {transaction.status < TransactionStatus.Success
            ? moment(transaction.createdAt).format()
            : moment(transaction.updatedAt).format()}
        </p>

        <Tooltip
          isOpen={isCopied ? true : undefined}
          content={isCopied ? 'Copied' : 'Copy the transaction URL'}
          closeDelay={0}
        >
          <Button
            isIconOnly
            color='primary'
            size='sm'
            variant='light'
            onPress={() => {
              const url = new URL(window.location.href);

              url.searchParams.set('tx_id', transaction.id.toString());

              copy(
                `${window.location.origin}/transactions/${transaction.id}?network=${network}&address=${encodeAddress(transaction.address, chainSS58)}`
              );
            }}
          >
            <IconShare className='h-4 w-4' />
          </Button>
        </Tooltip>
      </div>
      <Divider orientation='horizontal' />
      {isApiReady && account ? (
        upSm ? (
          <TxItems
            withDetails={withDetails}
            defaultOpen={defaultOpen}
            account={account}
            transaction={transaction}
            hasLargeCalls={hasLargeCalls}
            shouldLoadDetails={shouldLoadDetails}
            onLoadDetails={() => setShouldLoadDetails(true)}
          />
        ) : (
          <TxItemsSmall transaction={transaction} />
        )
      ) : (
        <div className='flex h-[100px] items-center justify-center'>
          <Spinner size='lg' variant='wave' />
        </div>
      )}
    </div>
  );
}

export default React.memo(TxCell);

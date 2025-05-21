// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { useQueryAccount } from '@/accounts/useQueryAccount';
import IconShare from '@/assets/svg/icon-share.svg?react';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import moment from 'moment';
import React from 'react';

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

function TxCell({ withDetails, defaultOpen, address, transaction }: Props) {
  const { status } = transaction;
  const upSm = useMediaQuery('sm');
  const [isCopied, copy] = useCopyClipboard();
  const { network, chain, chainSS58, isApiReady } = useApi();
  const [account] = useQueryAccount(address);

  return (
    <div className='space-y-3 p-3 sm:p-4 rounded-large bg-content1 border-1 border-secondary shadow-small'>
      <div className='flex items-center justify-between gap-2.5 flex-1'>
        <div className='flex items-center gap-2.5 flex-1'>
          <div
            data-pending={status < TransactionStatus.Success}
            data-success={status === TransactionStatus.Success}
            data-failed={status > TransactionStatus.Success}
            className='w-2 h-2 rounded-medium data-[pending=true]:bg-warning data-[success=true]:bg-success data-[failed=true]:bg-danger'
          />
          <Avatar src={chain.icon} className='w-5 h-5 bg-transparent' />
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
            <IconShare className='w-4 h-4' />
          </Button>
        </Tooltip>
      </div>
      <Divider orientation='horizontal' />
      {isApiReady && account ? (
        upSm ? (
          <TxItems withDetails={withDetails} defaultOpen={defaultOpen} account={account} transaction={transaction} />
        ) : (
          <TxItemsSmall transaction={transaction} />
        )
      ) : (
        <div className='flex justify-center items-center h-[100px]'>
          <Spinner size='lg' variant='wave' />
        </div>
      )}
    </div>
  );
}

export default React.memo(TxCell);

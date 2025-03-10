// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueryAccount } from '@/accounts/useQueryAccount';
import ExpandArrow from '@/assets/svg/expand-arrow.svg?react';
import { Empty } from '@/components';
import { useToggle } from '@/hooks/useToggle';
import { TxCell } from '@/transactions';
import React from 'react';

import { Button } from '@mimir-wallet/ui';

import { usePendingTx } from './usePendingTx';

interface Props {
  address: string;
  url: string;
}

function PendingTx({ address, url }: Props) {
  const txs = usePendingTx(address, url);
  const [expanded, toggleExpand] = useToggle();
  const [account] = useQueryAccount(address);
  const counts = txs.length || 0;

  return (
    <>
      <div
        data-expanded={expanded}
        className='pointer-events-none fixed w-full h-full left-0 right-0 top-0 bottom-0 bg-black/15 opacity-0 data-[expanded=true]:opacity-100 transition-opacity'
        onClick={toggleExpand}
        style={{ pointerEvents: expanded ? 'auto' : 'none' }}
      />

      <div
        data-expanded={expanded}
        className='fixed bottom-0 left-0 right-0 w-full h-[calc(50vh+60px)] bg-secondary translate-y-[50vh] transition-all data-[expanded=true]:translate-y-0'
      >
        <div className='cursor-pointer flex items-center justify-between h-[60px] px-6' onClick={toggleExpand}>
          <h6 data-expanded={expanded} className='font-bold text-medium text-secondary-foreground'>
            {counts} Pending Transactions
          </h6>
          <Button
            data-expanded={expanded}
            isIconOnly
            size='sm'
            color='secondary'
            radius='full'
            className='bg-primary/5 data-[expanded=true]:rotate-180'
            onPress={toggleExpand}
          >
            <ExpandArrow />
          </Button>
        </div>

        <div className='h-[50vh] p-5 overflow-y-auto space-y-5'>
          {account && txs.length > 0 ? (
            txs.map((item) => <TxCell account={account} defaultOpen={false} key={item.id} transaction={item} />)
          ) : (
            <Empty height={280} label='No Pending Transactions' />
          )}
        </div>
      </div>
    </>
  );
}

export default React.memo(PendingTx);

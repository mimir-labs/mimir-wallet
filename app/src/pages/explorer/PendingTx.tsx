// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
  const counts = txs.length || 0;

  return (
    <>
      <div
        data-expanded={expanded}
        className='pointer-events-none fixed top-0 right-0 bottom-0 left-0 h-full w-full bg-black/15 opacity-0 transition-opacity data-[expanded=true]:opacity-100'
        onClick={toggleExpand}
        style={{ pointerEvents: expanded ? 'auto' : 'none' }}
      />

      <div
        data-expanded={expanded}
        className='bg-secondary fixed right-0 bottom-0 left-0 h-[calc(50vh+60px)] w-full translate-y-[50vh] transition-all data-[expanded=true]:translate-y-0'
      >
        <div className='flex h-[60px] cursor-pointer items-center justify-between px-6' onClick={toggleExpand}>
          <h6 data-expanded={expanded} className='text-secondary-foreground text-base font-bold'>
            {counts} Pending Transactions
          </h6>
          <Button
            data-expanded={expanded}
            isIconOnly
            size='sm'
            color='secondary'
            radius='full'
            className='bg-primary/5 data-[expanded=true]:rotate-180'
            onClick={toggleExpand}
          >
            <ExpandArrow />
          </Button>
        </div>

        <div className='h-[50vh] space-y-5 overflow-y-auto p-5'>
          {txs.length > 0 ? (
            txs.map((item) => <TxCell address={address} defaultOpen={false} key={item.id} transaction={item} />)
          ) : (
            <Empty height={280} label='No Pending Transactions' />
          )}
        </div>
      </div>
    </>
  );
}

export default React.memo(PendingTx);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import ArrowRight from '@/assets/svg/ArrowRight.svg?react';
import { AppName } from '@/components';
import { CallDisplaySection } from '@/params';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@mimir-wallet/ui';

function AppCell({ transaction }: { transaction: Transaction }) {
  return <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />;
}

function ActionTextCell({ section, method }: { section?: string; method?: string }) {
  return <CallDisplaySection section={section} method={method} />;
}

function ActionsCell() {
  return (
    <Button color='primary' size='sm' variant='light' isIconOnly onPress={(e) => e.continuePropagation()}>
      <ArrowRight className='w-4 h-4 text-primary' />
    </Button>
  );
}

function TxItems({ transaction }: { transaction: Transaction }) {
  const navigate = useNavigate();

  return (
    <div
      className='grid grid-cols-7 rounded-medium overflow-hidden bg-secondary cursor-pointer px-2.5 font-semibold [&_div]:flex [&_div]:items-center [&_div]:h-10'
      onClick={() => navigate(`/transactions/${transaction.id}`)}
    >
      <div className='col-span-3'>
        <AppCell transaction={transaction} />
      </div>
      <div className='col-span-3 flex justify-center'>
        <ActionTextCell section={transaction.section} method={transaction.method} />
      </div>
      <div className='col-span-1 flex justify-end'>
        <ActionsCell />
      </div>
    </div>
  );
}

export default React.memo(TxItems);

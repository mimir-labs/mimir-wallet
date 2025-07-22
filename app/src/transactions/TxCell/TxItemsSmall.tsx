// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import ArrowRight from '@/assets/svg/ArrowRight.svg?react';
import { AppName } from '@/components';
import { CallDisplaySection } from '@/params';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
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
      <ArrowRight className='text-primary h-4 w-4' />
    </Button>
  );
}

function TxItems({ transaction }: { transaction: Transaction }) {
  const navigate = useNavigate();
  const { setNetwork } = useApi();

  return (
    <div
      className='rounded-medium bg-secondary grid cursor-pointer grid-cols-7 overflow-hidden px-2.5 font-semibold [&_div]:flex [&_div]:h-10 [&_div]:items-center'
      onClick={() => {
        setNetwork(transaction.network);
        navigate(`/transactions/${transaction.id}`);
      }}
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

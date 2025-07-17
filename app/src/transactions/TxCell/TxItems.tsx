// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { IMethod } from '@polkadot/types/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { AppName } from '@/components';
import { type AccountData, type Transaction, TransactionStatus, TransactionType } from '@/hooks/types';
import { useToggle } from '@/hooks/useToggle';
import { CallDisplayDetail, CallDisplaySection } from '@/params';
import { formatAgo } from '@/utils';
import moment from 'moment';
import React, { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Link, Tooltip } from '@mimir-wallet/ui';

import Progress from '../Progress';
import { AnnouncementStatus, MultisigStatus, Status } from '../Status';
import Extrinsic from './Extrinsic';
import OverviewDialog from './OverviewDialog';

function AppCell({ transaction }: { transaction: Transaction }) {
  return <AppName website={transaction.website} appName={transaction.appName} iconUrl={transaction.iconUrl} />;
}

function ActionTextCell({ section, method }: { section?: string; method?: string }) {
  return <CallDisplaySection section={section} method={method} />;
}

function ActionDisplayCell({ api, call }: { api: ApiPromise; call?: IMethod | null }) {
  return <CallDisplayDetail registry={api.registry} call={call} />;
}

function TimeCell({ time }: { time?: number }) {
  const now = Date.now();

  time ||= now;

  return (
    <Tooltip content={moment(time).format()}>
      {now - Number(time) < 1000 ? 'Now' : `${formatAgo(Number(time))} ago`}
    </Tooltip>
  );
}

function ActionsCell({ withDetails, detailOpen }: { withDetails?: boolean; detailOpen: boolean }) {
  return (
    <div className='flex w-full items-center justify-between'>
      <div />
      {withDetails ? (
        <Button isIconOnly color='primary' variant='light' onPress={(e) => e.continuePropagation()}>
          <ArrowDown
            className={`text-primary transform-origin-center transition-transform duration-200 ${
              detailOpen ? 'rotate-180' : 'rotate-0'
            }`}
            fontSize='0.6rem'
          />
        </Button>
      ) : (
        <Button as={Link} href='/transactions' variant='light'>
          View More
        </Button>
      )}
    </div>
  );
}

function TxItems({
  withDetails = true,
  defaultOpen,
  account,
  transaction
}: {
  withDetails?: boolean;
  defaultOpen?: boolean;
  account: AccountData;
  transaction: Transaction;
}) {
  const { api } = useApi();
  const [detailOpen, toggleDetailOpen] = useToggle(defaultOpen);

  const [overviewOpen, toggleOverviewOpen] = useToggle();
  const call = useMemo(() => {
    if (!transaction.call) return null;

    try {
      return api.registry.createTypeUnsafe('Call', [transaction.call]) as IMethod;
    } catch {
      return null;
    }
  }, [api, transaction.call]);

  return (
    <>
      <div className='rounded-medium bg-secondary overflow-hidden transition-all duration-200'>
        <div
          className='grid cursor-pointer grid-cols-10 gap-2.5 px-2.5 font-semibold sm:px-4 md:grid-cols-12 md:px-5 lg:grid-cols-[repeat(15,_minmax(0,_1fr))] [&>div]:flex [&>div]:h-10 [&>div]:items-center'
          onClick={toggleDetailOpen}
        >
          <div className='col-span-2'>
            <AppCell transaction={transaction} />
          </div>
          <div className='col-span-5'>
            <ActionTextCell section={transaction.section} method={transaction.method} />
          </div>
          <div className='col-span-3 hidden lg:flex'>
            <ActionDisplayCell api={api} call={call} />
          </div>
          <div className='col-span-2 hidden md:flex'>
            <TimeCell
              time={transaction.status < TransactionStatus.Success ? transaction.createdAt : transaction.updatedAt}
            />
          </div>
          <div className='col-span-2'>
            {transaction.status < TransactionStatus.Success ? (
              transaction.type === TransactionType.Announce ? (
                <AnnouncementStatus transaction={transaction} account={account} />
              ) : transaction.type === TransactionType.Multisig ? (
                <MultisigStatus transaction={transaction} onClick={toggleOverviewOpen} />
              ) : (
                <Status transaction={transaction} />
              )
            ) : (
              <Status transaction={transaction} />
            )}
          </div>
          <div className='col-span-1'>
            <ActionsCell withDetails={withDetails} detailOpen={detailOpen} />
          </div>
        </div>
        {withDetails && detailOpen && (
          <div className='rounded-medium bg-content1 mx-3 mb-3 flex flex-row gap-3 p-3 md:mx-4 md:mb-4 md:gap-4 md:p-4'>
            <Extrinsic defaultOpen={detailOpen} transaction={transaction} call={call} />
            <Progress openOverview={toggleOverviewOpen} account={account} transaction={transaction} />
          </div>
        )}
      </div>
      <OverviewDialog account={account} transaction={transaction} onClose={toggleOverviewOpen} open={overviewOpen} />
    </>
  );
}

export default React.memo(TxItems);

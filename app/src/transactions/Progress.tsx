// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, ProposeTransaction, ProxyTransaction, Transaction } from '@/hooks/types';

import { AddressCell, Empty } from '@/components';
import { TransactionStatus, TransactionType } from '@/hooks/types';
import { useBlockInterval } from '@/hooks/useBlockInterval';
import { useFilterPaths } from '@/hooks/useFilterPaths';
import { autoFormatTimeStr } from '@/utils';
import React, { useMemo } from 'react';

import { addressEq } from '@mimir-wallet/polkadot-core';
import { Button, Divider } from '@mimir-wallet/ui';

import Approve from './buttons/Approve';
import Cancel from './buttons/Cancel';
import ExecuteAnnounce from './buttons/ExecuteAnnounce';
import RemoveOrDeny from './buttons/RemoveOrDeny';
import RemovePropose from './buttons/RemovePropose';
import ViewPending from './buttons/ViewPending';
import { useAnnouncementProgress } from './hooks/useAnnouncementProgress';
import { approvalCounts } from './utils';

interface Props {
  className?: string;
  account: AccountData;
  transaction: Transaction;
  openOverview?: () => void;
}

function ProgressItem({
  account,
  transaction,
  address
}: {
  account?: AccountData;
  transaction?: Transaction;
  address: string;
}) {
  const [counts, threshold] = useMemo(
    () => (account && transaction ? approvalCounts(account, transaction) : [0, 1]),
    [account, transaction]
  );

  return (
    <div className='flex flex-col gap-[5px] p-[5px] w-full bg-primary/5 rounded-md'>
      <AddressCell showType withCopy withAddressBook shorten value={address} />
      <div className='overflow-hidden rounded-[1px] relative mx-9 h-[2px] bg-primary/10'>
        <div
          className='rounded-[1px] absolute left-0 top-0 bottom-0 bg-primary'
          style={{
            width: `${(counts / threshold) * 100}%`
          }}
        />
      </div>
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <div className='space-y-2.5'>{children}</div>;
}

function MultisigContent({
  account,
  transaction,
  button
}: {
  account: AccountData;
  transaction: Transaction;
  button?: React.ReactNode;
}) {
  return (
    <>
      <div className='flex items-center justify-between'>
        <p className='font-bold flex-1'>Confirmations</p>
        {button}
      </div>

      <Content>
        {transaction.children.length > 0 ? (
          transaction.children.map((tx, index) => (
            <ProgressItem
              key={index}
              account={
                account.type === 'multisig'
                  ? account.members.find((item) => addressEq(item.address, tx.address))
                  : undefined
              }
              transaction={tx}
              address={tx.address}
            />
          ))
        ) : (
          <Empty height={150} label='no approvals' />
        )}
      </Content>
    </>
  );
}

function ProxyContent({
  account,
  transaction,
  button
}: {
  account: AccountData;
  transaction: Transaction;
  button?: React.ReactNode;
}) {
  if (account.type === 'pure' && account.delegatees.length === 1 && account.delegatees[0].type === 'multisig') {
    const multisigAccount = account.delegatees[0];
    const multisigTransaction = transaction.children.find(
      (item) => item.type === TransactionType.Multisig && addressEq(item.address, multisigAccount.address)
    );

    if (multisigTransaction) {
      return <MultisigContent account={multisigAccount} transaction={multisigTransaction} button={button} />;
    }
  }

  return (
    <>
      <div className='flex items-center justify-between'>
        <p className='font-bold flex-1'>Proxy</p>
        {button}
      </div>

      <Content>
        {transaction.children.length > 0 ? (
          transaction.children.map((tx, index) => (
            <ProgressItem
              key={index}
              account={account.delegatees.find((item) => addressEq(item.address, tx.address))}
              transaction={tx}
              address={tx.address}
            />
          ))
        ) : transaction.delegate ? (
          <ProgressItem address={transaction.delegate} />
        ) : (
          <Empty height={150} label='no delegatees' />
        )}
      </Content>
    </>
  );
}

function ProposeContent({ transaction }: { transaction: ProposeTransaction }) {
  return (
    <>
      <div className='flex items-center justify-between font-bold'>Proposer</div>

      <Content>
        <div className='flex flex-col gap-[5px] p-[5px] w-full bg-primary/5 rounded-md'>
          <AddressCell showType withCopy withAddressBook shorten value={transaction.proposer} />
        </div>
      </Content>
    </>
  );
}

function AnnounceContent({
  account,
  transaction,
  button
}: {
  account: AccountData;
  transaction: ProxyTransaction;
  button?: React.ReactNode;
}) {
  const [startBlock, currentBlock, endBlock] = useAnnouncementProgress(transaction, account);
  const blockInterval = useBlockInterval().toNumber();

  const leftTime = currentBlock >= endBlock ? 0 : ((endBlock - currentBlock) * blockInterval) / 1000;

  const leftTimeFormat = useMemo(() => autoFormatTimeStr(leftTime * 1000), [leftTime]);

  const element =
    transaction.status === TransactionStatus.Pending ? (
      <div className='space-y-2.5'>
        <div className='flex items-center justify-between'>
          <p className='font-bold flex-1'>Review Time</p>
        </div>
        <div className='overflow-hidden rounded-[2px] relative h-[4px] bg-primary/10'>
          <div
            data-left={!!leftTime}
            className='rounded-[2px] absolute left-0 top-0 bottom-0 data-[left=true]:bg-primary data-[left=false]:bg-success'
            style={{
              width: `${(currentBlock > endBlock ? 1 : (currentBlock - startBlock) / (endBlock - startBlock)) * 100}%`
            }}
          />
        </div>

        <div className='flex items-center justify-between'>
          <p className='flex-1'>{currentBlock >= endBlock ? 'Finished' : 'Reviewing'}</p>
          {leftTime ? (leftTimeFormat ? `${leftTimeFormat} left` : '') : ''}
        </div>

        <div className='flex items-center justify-between'>
          <p className='font-bold flex-1'>Proxy</p>
          {button}
        </div>
      </div>
    ) : (
      <div className='flex items-center justify-between'>
        <p className='font-bold flex-1'>Proxy</p>
        {button}
      </div>
    );

  return (
    <>
      {element}

      <Content>
        {transaction.children.length > 0 ? (
          transaction.children.map((tx, index) => (
            <ProgressItem
              key={index}
              account={account.delegatees.find((item) => addressEq(item.address, tx.address))}
              transaction={tx}
              address={tx.address}
            />
          ))
        ) : transaction.delegate ? (
          <ProgressItem address={transaction.delegate} />
        ) : (
          <Empty height={150} label='no delegatees' />
        )}
      </Content>
    </>
  );
}

function Progress({ account, transaction, openOverview, ...props }: Props) {
  const filterPaths = useFilterPaths(account, transaction);

  return (
    <div className={'bg-primary/5 rounded-medium min-w-[280px] p-5 space-y-2.5 '.concat(props.className || '')}>
      <p className='font-bold text-primary'>Progress</p>
      <Divider className='bg-primary/5' />

      {transaction.type === TransactionType.Multisig ? (
        <MultisigContent
          account={account}
          transaction={transaction}
          button={
            openOverview ? (
              <Button onPress={openOverview} size='sm' variant='light'>
                Overview
              </Button>
            ) : null
          }
        />
      ) : transaction.type === TransactionType.Proxy ? (
        <ProxyContent
          account={account}
          transaction={transaction}
          button={
            openOverview ? (
              <Button onPress={openOverview} size='sm' variant='light'>
                Overview
              </Button>
            ) : null
          }
        />
      ) : transaction.type === TransactionType.Announce ? (
        <AnnounceContent
          account={account}
          transaction={transaction}
          button={
            openOverview ? (
              <Button onPress={openOverview} size='sm' variant='light'>
                Overview
              </Button>
            ) : null
          }
        />
      ) : transaction.type === TransactionType.Propose ? (
        <ProposeContent transaction={transaction} />
      ) : null}

      {transaction.exector ? (
        <>
          <Divider className='bg-primary/5' />

          <div className='font-bold'>Executor</div>

          <Content>
            <div className='flex flex-col gap-[5px] p-[5px] w-full bg-primary/5 rounded-md'>
              <AddressCell showType withCopy withAddressBook shorten value={transaction.exector} />
            </div>
          </Content>
        </>
      ) : null}

      {transaction.status < TransactionStatus.Success && (
        <>
          <Divider className='bg-primary/5' />

          <div className='space-y-2.5'>
            <Approve account={account} transaction={transaction} filterPaths={filterPaths} />
            <ExecuteAnnounce account={account} transaction={transaction} />
            <ViewPending transaction={transaction} filterPaths={filterPaths} />
            <Cancel account={account} transaction={transaction} />
            <RemoveOrDeny transaction={transaction} />
            <RemovePropose account={account} transaction={transaction} />
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(Progress);

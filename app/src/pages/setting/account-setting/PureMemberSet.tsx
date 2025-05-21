// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PureAccountData } from '@/hooks/types';

import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { usePendingTransactions } from '@/hooks/useTransactions';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Tab, Tabs, Tooltip } from '@mimir-wallet/ui';

import MemberSet from './MemberSet';

function PureMemberSet({ account }: { account: PureAccountData }) {
  const { network } = useApi();
  const multisigDelegatees = account.delegatees.filter((item) => item.type === 'multisig');
  const [txs] = usePendingTransactions(network, account.address);
  const navigate = useNavigate();

  if (multisigDelegatees.length === 0) {
    return null;
  }

  return (
    <div>
      <h6 className='inline-flex items-center gap-1 text-small text-foreground/50 mb-2.5'>
        Multisig Information
        <Tooltip
          closeDelay={0}
          classNames={{ content: 'max-w-[300px]' }}
          content='For Pure Proxy, each controllable multisig account is listed as a member set.'
        >
          <IconQuestion className='text-primary' />
        </Tooltip>
      </h6>
      <div className='p-4 sm:p-5 rounded-large border-1 border-secondary bg-content1 shadow-medium'>
        {txs.length > 0 && (
          <div
            className='text-primary cursor-pointer mb-5 font-bold'
            onClick={() => {
              navigate('/transactions');
            }}
          >
            Please process {txs.length} Pending Transaction first
          </div>
        )}

        {multisigDelegatees.length > 1 ? (
          <>
            <Tabs
              className='mb-2.5'
              classNames={{ tabList: 'p-0 rounded-none', tab: 'px-2 h-10', cursor: 'w-full' }}
              variant='underlined'
              color='primary'
            >
              {multisigDelegatees.map((item, index) => (
                <Tab title={`Members Set${index + 1}`} value={String(index)} key={index}>
                  <MemberSet account={item} pureAccount={account} disabled={!!txs.length} />
                </Tab>
              ))}
            </Tabs>
          </>
        ) : (
          <MemberSet account={multisigDelegatees[0]} pureAccount={account} disabled={!!txs.length} />
        )}
      </div>
    </div>
  );
}

export default PureMemberSet;

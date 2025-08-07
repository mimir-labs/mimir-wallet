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
      <h6 className='text-foreground/50 mb-2.5 inline-flex items-center gap-1 text-sm'>
        Multisig Information
        <Tooltip
          classNames={{ content: 'max-w-[300px]' }}
          content='For Pure Proxy, each controllable multisig account is listed as a member set.'
        >
          <IconQuestion className='text-primary' />
        </Tooltip>
      </h6>
      <div className='border-secondary bg-content1 shadow-medium rounded-[20px] border-1 p-4 sm:p-5'>
        {txs.length > 0 && (
          <div
            className='text-primary mb-5 cursor-pointer font-bold'
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

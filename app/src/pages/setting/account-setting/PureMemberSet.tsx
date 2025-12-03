// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PureAccountData } from '@/hooks/types';

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { Tab, Tabs, Tooltip } from '@mimir-wallet/ui';
import { useNavigate } from '@tanstack/react-router';
import { memo, useCallback, useMemo } from 'react';

import MemberSet from './MemberSet';

import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { usePendingTransactions } from '@/hooks/useTransactions';

function PureMemberSet({ account }: { account: PureAccountData }) {
  const { network } = useNetwork();
  const navigate = useNavigate();

  // Memoize filtered delegatees to avoid recalculation on every render
  const multisigDelegatees = useMemo(
    () => account.delegatees.filter((item) => item.type === 'multisig'),
    [account.delegatees]
  );

  // Call hooks unconditionally before any early returns
  const [txs] = usePendingTransactions(network, account.address);

  // Memoize navigate callback
  const handleNavigateToTransactions = useCallback(() => {
    navigate({ to: '/transactions' });
  }, [navigate]);

  // Early return after all hooks
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
          <div className='text-primary mb-5 cursor-pointer font-bold' onClick={handleNavigateToTransactions}>
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

// Memoize component to prevent unnecessary re-renders
export default memo(PureMemberSet);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import { useQueryParam } from '@/hooks/useQueryParams';

import { Tab, Tabs } from '@mimir-wallet/ui';

import HistoryTransactions from './HistoryTransactions';
import PendingTransactions from './PendingTransactions';

function MultisigList({ address }: { address: string }) {
  const [account] = useQueryAccount(address);

  const [type, setType] = useQueryParam<string>('status', 'pending');
  const [txId] = useQueryParam<string>('tx_id');

  if (!account) return null;

  return (
    <div className='space-y-5'>
      <Tabs
        color='primary'
        aria-label='Transaction'
        selectedKey={type}
        onSelectionChange={(key) => setType(key.toString())}
      >
        <Tab key='pending' title='Pending'>
          <PendingTransactions account={account} txId={txId} />
        </Tab>
        <Tab key='history' title='History'>
          <HistoryTransactions account={account} txId={txId} />
        </Tab>
      </Tabs>
    </div>
  );
}

function Content({ address }: { address: string }) {
  return <MultisigList address={address} />;
}

function PageTransaction() {
  const selected = useSelectedAccount();

  if (!selected) return null;

  return <Content address={selected} />;
}

export default PageTransaction;

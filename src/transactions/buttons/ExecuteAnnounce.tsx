// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, ProxyTransaction } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import React from 'react';

import { toastError } from '@mimir-wallet/components';
import { useApi, useTxQueue, useWallet } from '@mimir-wallet/hooks';
import { TransactionType } from '@mimir-wallet/hooks/types';
import { addressEq } from '@mimir-wallet/utils';

import { useAnnouncementStatus } from '../hooks/useAnnouncementStatus';

function ExecuteAnnounce({ account, transaction }: { account: AccountData; transaction: ProxyTransaction }) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();
  const { walletAccounts } = useWallet();
  const [status] = useAnnouncementStatus(transaction, account);

  if (walletAccounts.length === 0) {
    return null;
  }

  if (transaction.type !== TransactionType.Announce) {
    return null;
  }

  const call = transaction.call;

  if (!call) {
    return null;
  }

  const delegate = transaction.delegate;

  if (!delegate) {
    return null;
  }

  if (status !== 'executable') {
    return null;
  }

  return (
    <LoadingButton
      fullWidth
      variant='contained'
      onClick={async () => {
        const proxies = await api.query.proxy.proxies(transaction.address);

        const proxyDefine = proxies[0].find((item) => addressEq(item.delegate, delegate));

        if (!proxyDefine) {
          toastError(`can not find delegate(${delegate})`);

          return;
        }

        addQueue({
          accountId: walletAccounts[0].address,
          call: api.tx.proxy.proxyAnnounced(delegate, transaction.address, proxyDefine.proxyType, call)
        });
      }}
    >
      Execute
    </LoadingButton>
  );
}

export default React.memo<typeof ExecuteAnnounce>(ExecuteAnnounce);

// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { addressEq, ApiManager, useNetwork } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';
import { Tooltip } from '@mimir-wallet/ui';
import React, { useMemo } from 'react';

import { useAccount } from '@/accounts/useAccount';
import IconFailed from '@/assets/svg/icon-failed-outlined.svg?react';
import { TxButton } from '@/components';
import { TransactionType } from '@/hooks/types';

async function fetchMultisigInfo({
  queryKey,
}: {
  queryKey: readonly [string, string, string, string];
}) {
  const [, network, address, callHash] = queryKey;

  if (!address || !callHash) {
    throw new Error('Invalid multisig transaction');
  }

  const api = await ApiManager.getInstance().getApi(network);

  return api.query.multisig.multisigs(address, callHash);
}

function Cancel({
  isIcon = false,
  transaction,
}: {
  isIcon?: boolean;
  transaction: Transaction;
}) {
  const { network } = useNetwork();
  const { isLocalAccount } = useAccount();

  const multisigTx = useMemo(() => {
    if (transaction.type === TransactionType.Multisig) {
      return transaction;
    }

    if (transaction.type === TransactionType.Proxy) {
      const subTransaction = transaction.children.find(
        (item) => item.type === TransactionType.Multisig,
      );

      return subTransaction || null;
    }

    return null;
  }, [transaction]);

  const { data: multisigInfo } = useQuery({
    queryKey: [
      'multisig-info',
      network,
      multisigTx?.address || '',
      multisigTx?.callHash || '',
    ] as const,
    enabled: !!multisigTx,
    refetchOnMount: false,
    queryFn: fetchMultisigInfo,
  });

  const depositor = useMemo(
    () =>
      multisigInfo?.isSome ? multisigInfo.unwrap().depositor.toString() : null,
    [multisigInfo],
  );

  if (!(multisigTx && multisigInfo && depositor && isLocalAccount(depositor))) {
    return null;
  }

  return (
    <Tooltip content={isIcon ? 'Cancel' : undefined}>
      <TxButton
        isIconOnly={isIcon}
        fullWidth={!isIcon}
        variant={isIcon ? 'light' : 'ghost'}
        size={isIcon ? 'sm' : 'md'}
        color="danger"
        accountId={depositor}
        website="mimir://internal/cancel"
        getCall={async () => {
          const api = await ApiManager.getInstance().getApi(network);

          return api.tx.multisig.cancelAsMulti(
            multisigTx.threshold,
            multisigTx.members.filter((item) => !addressEq(item, depositor)),
            multisigInfo?.unwrap().when,
            multisigTx.callHash,
          );
        }}
      >
        {isIcon ? <IconFailed /> : 'Cancel'}
      </TxButton>
    </Tooltip>
  );
}

export default React.memo<typeof Cancel>(Cancel);

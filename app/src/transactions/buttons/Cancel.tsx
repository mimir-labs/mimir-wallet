// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { TxButton } from '@/components';
import { TransactionType } from '@/hooks/types';
import React, { useMemo } from 'react';

import { addressEq, addressToHex, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

function Cancel({ account, transaction }: { account: AccountData; transaction: Transaction }) {
  const { api, genesisHash, isApiReady } = useApi();
  const { isLocalAccount } = useAccount();

  const multisigTx = useMemo(() => {
    if (transaction.type === TransactionType.Multisig) {
      return transaction;
    }

    if (transaction.type === TransactionType.Proxy) {
      if (account.type === 'pure') {
        const subTransaction = transaction.children.find((item) => item.type === TransactionType.Multisig);

        return subTransaction || null;
      }
    }

    return null;
  }, [account, transaction]);

  const { data: multisigInfo } = useQuery({
    queryKey: [multisigTx?.address, multisigTx?.callHash] as const,
    queryHash: `${genesisHash}.api.query.multisig.multisigs(${multisigTx?.address ? addressToHex(multisigTx.address) : ''},${
      multisigTx?.callHash ? multisigTx.callHash : ''
    })`,
    enabled: isApiReady && !!multisigTx,
    refetchOnMount: false,
    queryFn: ({ queryKey }) => {
      const [address, callHash] = queryKey;

      if (!address || !callHash) {
        throw new Error('Invalid multisig transaction');
      }

      return api.query.multisig.multisigs(address, callHash);
    }
  });

  const depositor = useMemo(
    () => (multisigInfo?.isSome ? multisigInfo.unwrap().depositor.toString() : null),
    [multisigInfo]
  );

  if (!(multisigTx && multisigInfo && depositor && isLocalAccount(depositor))) {
    return null;
  }

  return (
    <TxButton
      fullWidth
      variant='ghost'
      color='danger'
      isDisabled={!transaction.call}
      accountId={depositor}
      website='mimir://internal/cancel'
      getCall={() =>
        api.tx.multisig.cancelAsMulti(
          multisigTx.threshold,
          multisigTx.members.filter((item) => !addressEq(item, depositor)),
          multisigInfo?.unwrap().when,
          multisigTx.callHash
        )
      }
    >
      Cancel
    </TxButton>
  );
}

export default React.memo<typeof Cancel>(Cancel);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
import type { PalletMultisigMultisig } from '@polkadot/types/lookup';
import type { AccountData, Transaction } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import React, { useMemo } from 'react';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { TransactionType } from '@mimir-wallet/hooks/types';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useCall } from '@mimir-wallet/hooks/useCall';
import { useTxQueue } from '@mimir-wallet/hooks/useTxQueue';
import { addressEq } from '@mimir-wallet/utils';

function Cancel({ account, transaction }: { account: AccountData; transaction: Transaction }) {
  const { api } = useApi();
  const { addQueue } = useTxQueue();
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

  const multisigInfo = useCall<Option<PalletMultisigMultisig>>(multisigTx ? api.query.multisig.multisigs : undefined, [
    multisigTx?.address,
    multisigTx?.callHash
  ]);

  const depositor = useMemo(
    () => (multisigInfo?.isSome ? multisigInfo.unwrap().depositor.toString() : null),
    [multisigInfo]
  );

  if (!multisigTx || !multisigInfo || !depositor || !isLocalAccount(depositor)) {
    return null;
  }

  return (
    <LoadingButton
      fullWidth
      color='error'
      variant='outlined'
      onClick={() => {
        addQueue({
          accountId: depositor,
          call: api.tx.multisig.cancelAsMulti(
            multisigTx.threshold,
            multisigTx.members.filter((item) => !addressEq(item, depositor)),
            multisigInfo?.unwrap().when,
            multisigTx.callHash
          ),
          website: 'mimir://internal/cancel'
        });
      }}
    >
      Cancel
    </LoadingButton>
  );
}

export default React.memo<typeof Cancel>(Cancel);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, Transaction } from '@/hooks/types';
import type { Option } from '@polkadot/types';
import type { PalletMultisigMultisig } from '@polkadot/types/lookup';

import { useAccount } from '@/accounts/useAccount';
import { TxButton } from '@/components';
import { TransactionType } from '@/hooks/types';
import { useApi } from '@/hooks/useApi';
import { useCall } from '@/hooks/useCall';
import { addressEq } from '@/utils';
import React, { useMemo } from 'react';

function Cancel({ account, transaction }: { account: AccountData; transaction: Transaction }) {
  const { api } = useApi();
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

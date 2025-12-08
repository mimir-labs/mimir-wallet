// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiManager, useNetwork } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';
import { Button, Tooltip } from '@mimir-wallet/ui';
import { blake2AsHex } from '@polkadot/util-crypto';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import RecoverTx from './RecoverTx';

import IconSuccess from '@/assets/svg/icon-success-outlined.svg?react';
import { toastError } from '@/components/utils';
import {
  type AccountData,
  type FilterPath,
  type Transaction,
  TransactionType,
} from '@/hooks/types';
import { useTxQueue } from '@/hooks/useTxQueue';

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

function ExecuteMultisig({
  transaction,
  account,
}: {
  account: AccountData;
  transaction: Transaction;
}) {
  const { network } = useNetwork();
  const [isOpen, toggleOpen] = useToggle(false);
  const { addQueue } = useTxQueue();

  const handleApprove = () => {
    if (transaction.call) {
      addQueue({
        accountId: account.address,
        call: transaction.call,
        network,
      });
    } else {
      toggleOpen(true);
    }
  };

  const handleRecover = async (calldata: string) => {
    const api = await ApiManager.getInstance().getApi(network);

    const call = api.createType('Call', calldata);

    if (
      (transaction.type === TransactionType.Multisig
        ? blake2AsHex(call.toU8a())
        : call.hash.toHex()) !== transaction.callHash
    ) {
      toastError('Invalid call data');

      return;
    }

    addQueue({
      accountId: account.address,
      call,
      network,
    });

    toggleOpen(false);
  };

  return (
    <>
      <Button fullWidth variant="solid" color="primary" onClick={handleApprove}>
        Execute
      </Button>

      <RecoverTx
        transaction={transaction}
        isOpen={isOpen}
        onClose={toggleOpen}
        handleRecover={handleRecover}
      />
    </>
  );
}

function Approve({
  isIcon = false,
  account,
  transaction,
  filterPaths,
}: {
  isIcon?: boolean;
  account: AccountData;
  transaction: Transaction;
  filterPaths: FilterPath[][];
}) {
  const { network } = useNetwork();
  const [isOpen, toggleOpen] = useToggle(false);
  const { addQueue } = useTxQueue();

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
    enabled: !!multisigTx?.callHash,
    refetchOnMount: false,
    queryFn: fetchMultisigInfo,
  });

  if (
    multisigTx &&
    multisigInfo &&
    multisigInfo.unwrapOrDefault().approvals.length >= multisigTx.threshold
  ) {
    return <ExecuteMultisig transaction={transaction} account={account} />;
  }

  if (
    (transaction.type !== TransactionType.Multisig &&
      transaction.type !== TransactionType.Proxy &&
      transaction.type !== TransactionType.Propose) ||
    !filterPaths.length
  ) {
    return null;
  }

  const handleApprove = () => {
    if (transaction.call) {
      addQueue({
        accountId: account.address,
        transaction,
        call: transaction.call,
        network,
      });
    } else {
      toggleOpen(true);
    }
  };

  const handleRecover = async (calldata: string) => {
    const api = await ApiManager.getInstance().getApi(network);

    const call = api.createType('Call', calldata);

    if (
      (transaction.type === TransactionType.Multisig
        ? blake2AsHex(call.toU8a())
        : call.hash.toHex()) !== transaction.callHash
    ) {
      toastError('Invalid call data');

      return;
    }

    addQueue({
      accountId: account.address,
      transaction,
      call,
      network,
    });

    toggleOpen(false);
  };

  return (
    <>
      {isIcon ? (
        <Tooltip content="Approve">
          <Button
            size="sm"
            isIconOnly
            variant="light"
            color="success"
            onClick={handleApprove}
          >
            <IconSuccess />
          </Button>
        </Tooltip>
      ) : (
        <Button
          fullWidth
          variant="solid"
          color="primary"
          onClick={handleApprove}
        >
          Approve
        </Button>
      )}

      <RecoverTx
        transaction={transaction}
        isOpen={isOpen}
        onClose={toggleOpen}
        handleRecover={handleRecover}
      />
    </>
  );
}

export default React.memo<typeof Approve>(Approve);

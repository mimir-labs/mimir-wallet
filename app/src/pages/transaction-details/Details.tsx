// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';

import { useNetwork } from '@mimir-wallet/polkadot-core';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Divider,
} from '@mimir-wallet/ui';
import React from 'react';
import { useToggle } from 'react-use';

import { AddressCell, Bytes, Hash } from '@/components';
import { useFindTargetCallFromMethod } from '@/hooks/useFindTargetCall';
import { useParseCall } from '@/hooks/useParseCall';
import { FunctionArgs } from '@/params';
import { formatDate } from '@/utils';

function Item({
  content,
  title,
}: {
  title?: React.ReactNode;
  content?: React.ReactNode;
}) {
  return (
    <div className="space-y-[5px]">
      <div className="font-bold">{title}</div>

      <div className="bg-secondary rounded-[10px] p-2.5">{content}</div>
    </div>
  );
}

function Target({ call, address }: { address: string; call?: IMethod | null }) {
  const { network } = useNetwork();

  // Find target call using async hook
  const { from, targetCall, isLoading } = useFindTargetCallFromMethod(
    network,
    address,
    call,
  );

  if (!call || isLoading) {
    return null;
  }

  return (
    <>
      <Item
        title="From"
        content={<AddressCell iconSize={40} withCopy value={from} />}
      />

      {targetCall ? (
        <FunctionArgs
          displayType="vertical"
          from={from}
          registry={targetCall.registry}
          call={targetCall}
        />
      ) : null}

      {!call && (
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            {`This transaction wasn't initiated from Mimir. Please confirm the security of this transaction.`}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

function Details({ transaction }: { transaction: Transaction }) {
  const { network } = useNetwork();
  const [isOpen, toggleOpen] = useToggle(false);

  // Parse call data using async hook
  const { call } = useParseCall(network, transaction.call);

  return (
    <div className="card-root space-y-2.5 p-4">
      <h6 className="text-primary">Detail</h6>
      <Divider />

      <Item title="Created Time" content={formatDate(transaction.createdAt)} />
      {transaction.note && <Item title="Note" content={transaction.note} />}
      <Item
        title="Created Transaction"
        content={
          <Hash
            value={transaction.createdExtrinsicHash}
            withCopy
            withExplorer
          />
        }
      />
      {transaction.executedExtrinsicHash && (
        <Item
          title="Executed Transaction"
          content={
            <Hash
              value={transaction.executedExtrinsicHash}
              withCopy
              withExplorer
            />
          }
        />
      )}

      <Target address={transaction.address} call={call} />

      {!isOpen && (
        <Button
          fullWidth
          color="secondary"
          radius="md"
          variant="solid"
          onClick={toggleOpen}
        >
          Detail
        </Button>
      )}

      {isOpen && (
        <>
          <Item
            title="Call Hash"
            content={<Hash value={transaction.callHash} withCopy />}
          />
          {transaction.call && (
            <Item
              title="Call Data"
              content={<Bytes value={transaction.call} />}
            />
          )}
          <Item title="Created Block" content={transaction.createdBlock} />
          {transaction.executedBlock && (
            <Item title="Executed Block" content={transaction.executedBlock} />
          )}
          {transaction.cancelBlock && (
            <Item title="Cancel Block" content={transaction.cancelBlock} />
          )}
          {transaction.cancelExtrinsicHash && (
            <Item
              title="Cancel Transaction"
              content={
                <Hash
                  value={transaction.cancelExtrinsicHash}
                  withCopy
                  withExplorer
                />
              }
            />
          )}
        </>
      )}
    </div>
  );
}

export default React.memo(Details);

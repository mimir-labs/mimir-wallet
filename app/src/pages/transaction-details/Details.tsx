// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';

import { AddressCell, Bytes, Hash } from '@/components';
import { FunctionArgs } from '@/params';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { findTargetCall, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Divider } from '@mimir-wallet/ui';

function Item({ content, title }: { title?: React.ReactNode; content?: React.ReactNode }) {
  return (
    <div className='space-y-[5px]'>
      <div className='font-bold'>{title}</div>

      <div className='p-2.5 bg-secondary rounded-medium'>{content}</div>
    </div>
  );
}

function Target({ call, address }: { address: string; call?: IMethod | null }) {
  const { api } = useApi();
  const [from, targetCall] = useMemo(() => findTargetCall(api, address, call), [address, api, call]);

  if (!call) {
    return null;
  }

  return (
    <>
      <Item title='From' content={<AddressCell iconSize={40} withCopy value={from} />} />

      {targetCall ? (
        <FunctionArgs displayType='vertical' from={from} registry={api.registry} call={targetCall} jsonFallback />
      ) : null}

      {!call && (
        <Alert title='Warning' color='warning'>
          This transaction wasn’t initiated from Mimir. Please confirm the security of this transaction.
        </Alert>
      )}
    </>
  );
}

function Details({ transaction }: { transaction: Transaction }) {
  const { api } = useApi();
  const [isOpen, toggleOpen] = useToggle(false);

  const call = useMemo(() => {
    if (!transaction.call) return null;

    try {
      return api.createType('Call', transaction.call);
    } catch {
      return null;
    }
  }, [api, transaction.call]);

  return (
    <div className='space-y-2.5 bg-content1 border-1 border-secondary shadow-medium p-4 rounded-large'>
      <h6 className='text-primary'>Detail</h6>
      <Divider />

      <Item title='Created Time' content={moment(transaction.createdAt).format()} />
      {transaction.note && <Item title='Note' content={transaction.note} />}
      <Item
        title='Created Extrinsic'
        content={<Hash value={transaction.createdExtrinsicHash} withCopy withExplorer />}
      />
      {transaction.executedExtrinsicHash && (
        <Item
          title='Executed Extrinsic'
          content={<Hash value={transaction.executedExtrinsicHash} withCopy withExplorer />}
        />
      )}

      <Target address={transaction.address} call={call} />

      {!isOpen && (
        <Button fullWidth color='secondary' radius='md' variant='solid' onPress={toggleOpen}>
          Detail
        </Button>
      )}

      {isOpen && (
        <>
          <Item title='Call Hash' content={<Hash value={transaction.callHash} withCopy />} />
          {transaction.call && <Item title='Call Data' content={<Bytes value={transaction.call} />} />}
          <Item title='Created Block' content={transaction.createdBlock} />
          {transaction.executedBlock && <Item title='Executed Block' content={transaction.executedBlock} />}
          {transaction.cancelBlock && <Item title='Cancel Block' content={transaction.cancelBlock} />}
          {transaction.cancelExtrinsicHash && (
            <Item
              title='Cancel Extrinsic'
              content={<Hash value={transaction.cancelExtrinsicHash} withCopy withExplorer />}
            />
          )}
        </>
      )}
    </div>
  );
}

export default React.memo(Details);

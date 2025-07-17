// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { events } from '@/events';
import { useToggle } from '@/hooks/useToggle';
import { Call as CallComp } from '@/params';
import moment from 'moment';
import { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider } from '@mimir-wallet/ui';

import Bytes from '../Bytes';
import Hash from '../Hash';

interface Extracted {
  callName: string;
  callHash: HexString;
  callData: HexString;
}

function extractState(value: IMethod): Extracted {
  const { method, section } = value.registry.findMetaCall(value.callIndex);

  return {
    callName: `${section}.${method}`,
    callHash: value.hash.toHex(),
    callData: value.toHex()
  };
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='text-tiny grid w-full grid-cols-10 gap-2.5'>
      <div className='col-span-2 flex items-center font-bold'>{label}</div>
      <div className='text-foreground/65 col-span-8 flex items-center font-bold'>{value}</div>
    </div>
  );
}

function Call({
  account,
  method,
  transaction
}: {
  account?: string;
  method: IMethod;
  transaction?: Transaction | null;
}) {
  const { api, network } = useApi();

  // TODO: check if the call is a multisig, if so, use the blake2 of the call data as the call hash
  const { callData, callHash, callName } = useMemo(() => extractState(method), [method]);
  const [isOpen, toggleOpen] = useToggle(true);

  const details = (
    <div className='bg-secondary rounded-medium space-y-1 p-2.5'>
      <Item label='Call Hash' value={<Hash value={callHash} withCopy />} />
      <Item
        label='Call Data'
        value={
          <div className='flex items-center'>
            <Bytes value={callData} />
            <Button
              size='sm'
              color='primary'
              variant='light'
              onPress={() => events.emit('call_data_view', network, callData)}
            >
              View Detail
            </Button>
          </div>
        }
      />

      {transaction?.note && <Item label='Call Data' value={transaction.note} />}
      {transaction?.createdBlock && <Item label='Created Block' value={transaction.createdBlock} />}
      {transaction?.createdExtrinsicHash && (
        <Item
          label='Created Extrinsic'
          value={<Hash value={transaction.createdExtrinsicHash} withCopy withExplorer />}
        />
      )}
      {transaction?.createdAt && <Item label='Created Time' value={moment(transaction.createdAt).format()} />}
      {transaction?.executedBlock && <Item label='Executed Block' value={transaction.executedBlock} />}
      {transaction?.executedExtrinsicHash && (
        <Item
          label='Executed Extrinsic'
          value={<Hash value={transaction.executedExtrinsicHash} withCopy withExplorer />}
        />
      )}
      {transaction?.cancelBlock && <Item label='Cancel Block' value={transaction.cancelBlock} />}
      {transaction?.cancelExtrinsicHash && (
        <Item label='Cancel Extrinsic' value={<Hash value={transaction.cancelExtrinsicHash} withCopy withExplorer />} />
      )}
    </div>
  );

  return (
    <div className='space-y-3'>
      <div className='font-bold'>Transaction details</div>
      <div className='text-primary font-bold'>{callName}</div>
      <div className='rounded-medium border-secondary space-y-4 border-1 p-2.5'>
        <CallComp from={account} registry={api.registry} call={method} jsonFallback />
        <Divider />

        <div onClick={toggleOpen} className='text-primary text-small cursor-pointer font-bold'>
          {isOpen ? 'Hide Details' : 'View Details'}
        </div>
        {isOpen ? details : null}
      </div>
    </div>
  );
}

export default Call;

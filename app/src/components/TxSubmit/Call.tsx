// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { events } from '@/events';
import { Call as CallComp, FunctionArgs } from '@/params';
import moment from 'moment';
import { useMemo } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Divider } from '@mimir-wallet/ui';

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

function Item({ title, content }: { title: string; content: React.ReactNode }) {
  return (
    <div className='grid w-full grid-cols-10 gap-2.5 text-xs'>
      <div className='col-span-2 flex items-center font-bold'>{title}</div>
      <div className='text-foreground/65 col-span-8 flex items-center font-bold'>{content}</div>
    </div>
  );
}

function CallInfo({ callName, call }: { callName: string; call: IMethod }) {
  return (
    <details className='group' open>
      <summary className='hover:text-primary flex cursor-pointer list-none items-center justify-between no-underline transition-colors'>
        <b className='flex-1'>{callName}</b>
        <ArrowDown className='transform transition-transform group-open:rotate-180' />
      </summary>

      <FunctionArgs
        className='bg-secondary mt-[5px] flex w-full shrink-0 flex-col gap-2.5 rounded-[10px] p-2.5'
        registry={call.registry}
        call={call}
      />
    </details>
  );
}

function TransactionInfo({
  network,
  transaction,
  callHash,
  callData
}: {
  network: string;
  transaction?: Transaction | null;
  callHash: HexString;
  callData: HexString;
}) {
  return (
    <details className='group' open>
      <summary className='hover:text-primary flex cursor-pointer list-none items-center justify-between font-bold no-underline transition-colors'>
        <span className='group-open:hidden'>View Details</span>
        <span className='hidden group-open:block'>Hide Details</span>
        <ArrowDown className='transform transition-transform group-open:rotate-180' />
      </summary>

      <div className='border-divider-300 mt-[5px] flex flex-col gap-2.5 rounded-[10px] border-1 p-2.5'>
        <Item title='Call Hash' content={<Hash value={callHash} withCopy />} />
        <Item
          title='Call Data'
          content={
            <div className='flex items-center'>
              <Bytes value={callData} />
              <button className='text-primary' onClick={() => events.emit('call_data_view', network, callData)}>
                View Detail
              </button>
            </div>
          }
        />

        {transaction?.createdExtrinsicHash && (
          <Item
            title='Created Transaction'
            content={<Hash value={transaction.createdExtrinsicHash} withCopy withExplorer />}
          />
        )}
        {transaction?.executedExtrinsicHash && (
          <Item
            title='Executed Transaction'
            content={<Hash value={transaction.executedExtrinsicHash} withCopy withExplorer />}
          />
        )}

        {transaction?.note && <Item title='Note' content={transaction.note} />}
        {transaction?.createdBlock && <Item title='Created Block' content={transaction.createdBlock} />}
        {transaction?.createdAt && <Item title='Created Time' content={moment(transaction.createdAt).format()} />}
      </div>
    </details>
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
  const callElement = <CallComp from={account} registry={api.registry} call={method} />;

  return (
    <>
      {callElement}

      <Divider />

      <CallInfo callName={callName} call={method} />
      <TransactionInfo transaction={transaction} network={network} callData={callData} callHash={callHash} />
    </>
  );
}

export default Call;

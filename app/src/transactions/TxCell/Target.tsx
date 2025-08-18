// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import IconBatch from '@/assets/svg/icon-batch.svg?react';
import IconTemplate from '@/assets/svg/icon-template.svg?react';
import { events } from '@/events';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { Call as CallComp, FunctionArgs } from '@/params';
import React, { useMemo, useRef } from 'react';

import { findTargetCall, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Tooltip } from '@mimir-wallet/ui';

function CallInfo({ address, call }: { address: string; call: IMethod }) {
  const { network } = useApi();
  const [, addTx] = useBatchTxs(network, address);

  const action = useMemo(() => {
    try {
      const { method, section } = call.registry.findMetaCall(call.callIndex);

      if (section && method) {
        return `${section}.${method}`;
      }

      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }, [call.callIndex, call.registry]);

  return (
    <div className='flex w-full flex-col items-start justify-start gap-[5px]'>
      <div className='flex w-full shrink-0 flex-row items-center justify-start gap-2.5'>
        <b className='flex-1'>{action}</b>
        <Tooltip content='For better repeatly submit this transaction you can add to Template' color='foreground'>
          <Button variant='ghost' size='sm' onClick={() => events.emit('template_add', network, call.toHex())}>
            + Template
            <IconTemplate className='h-3.5 w-3.5' />
          </Button>
        </Tooltip>
        <Tooltip content='Submit exact same transactions' color='foreground'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              addTx([
                {
                  calldata: call.toHex()
                }
              ]);
            }}
          >
            + Batch
            <IconBatch />
          </Button>
        </Tooltip>
      </div>
      <FunctionArgs
        className='bg-secondary flex w-full shrink-0 flex-col gap-2.5 rounded-[10px] p-2.5'
        registry={call.registry}
        call={call}
      />
    </div>
  );
}

function Target({ call, address }: { address: string; call?: IMethod | null }) {
  const { api } = useApi();
  const [from, targetCall] = useMemo(() => findTargetCall(api, address, call), [address, api, call]);
  const ref = useRef<any>(null);

  if (!targetCall) {
    return null;
  }

  const callElement = targetCall ? (
    <CallComp ref={ref} from={from} registry={targetCall.registry} call={targetCall} />
  ) : null;

  return (
    <>
      {callElement}
      <Divider className='first:hidden' />
      <CallInfo call={targetCall} address={address} />
    </>
  );
}

export default React.memo(Target);

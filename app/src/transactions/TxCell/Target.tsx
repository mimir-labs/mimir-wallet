// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { Button, cn, Divider, Tooltip } from '@mimir-wallet/ui';
import React, { useMemo, useRef } from 'react';

import IconBatch from '@/assets/svg/icon-batch.svg?react';
import IconTemplate from '@/assets/svg/icon-template.svg?react';
import { events } from '@/events';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useFindTargetCallFromMethod } from '@/hooks/useFindTargetCall';
import { Call as CallComp, FunctionArgs } from '@/params';

function CallInfo({
  isMobile = false,
  address,
  call,
}: {
  isMobile?: boolean;
  address: string;
  call: IMethod;
}) {
  const { network } = useNetwork();
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
    <div
      data-mobile={isMobile}
      className={cn(
        'flex w-full flex-col items-start justify-start gap-[5px]',
        'data-[mobile=true]:card-root data-[mobile=true]:p-[15px]',
      )}
    >
      <div className="flex w-full shrink-0 flex-row items-center justify-start gap-2.5">
        <b className="flex-1">{action}</b>
        <Tooltip
          content="For better repeatly submit this transaction you can add to Template"
          color="foreground"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => events.emit('template_add', network, call.toHex())}
          >
            + Template
            <IconTemplate className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Submit exact same transactions" color="foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              addTx([
                {
                  calldata: call.toHex(),
                },
              ]);
            }}
          >
            + Batch
            <IconBatch />
          </Button>
        </Tooltip>
      </div>
      <FunctionArgs
        className="bg-secondary flex w-full shrink-0 flex-col gap-2.5 rounded-[10px] p-2.5"
        registry={call.registry}
        call={call}
      />
    </div>
  );
}

function Target({
  isMobile = false,
  call,
  address,
}: {
  isMobile?: boolean;
  address: string;
  call?: IMethod | null;
}) {
  const { network } = useNetwork();
  const ref = useRef<any>(null);

  // Find target call using async hook
  const { from, targetCall, isLoading } = useFindTargetCallFromMethod(
    network,
    address,
    call,
  );

  if (isLoading || !targetCall) {
    return null;
  }

  const Wrapper = isMobile ? 'div' : React.Fragment;

  const callElement = targetCall ? (
    <Wrapper className="card-root p-[15px]">
      <CallComp
        ref={ref}
        from={from}
        registry={targetCall.registry}
        call={targetCall}
      />
    </Wrapper>
  ) : null;

  return (
    <>
      {callElement}
      {isMobile ? null : <Divider className="first:hidden" />}
      <CallInfo isMobile={isMobile} call={targetCall} address={address} />
    </>
  );
}

export default React.memo(Target);

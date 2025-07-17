// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { Call, CallDisplayDetail } from '@/params';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/ui';

interface Props {
  children: React.ReactNode;
  actions?: React.ReactNode;
  calldata: HexString;
  registry: Registry;
  from: string;
  bgcolor?: string;
}

function BatchItem({ children, actions, from, calldata, bgcolor, registry }: Props) {
  const [isOpen, toggleOpen] = useToggle(false);

  const call = useMemo(() => {
    try {
      return registry.createType('Call', calldata);
    } catch {
      return null;
    }
  }, [registry, calldata]);

  if (!call) {
    return null;
  }

  return (
    <div data-open={isOpen} className='bg-secondary rounded-medium overflow-hidden' style={{ background: bgcolor }}>
      <div className='text-small grid h-[44px] cursor-pointer grid-cols-6 px-2 sm:px-3' onClick={toggleOpen}>
        {children}
        <div className='col-span-2 flex items-center'>
          <CallDisplayDetail fallbackWithName registry={registry} call={call} />
        </div>
        <div className='col-span-1 flex items-center justify-between'>
          {actions || <div />}
          <Button
            isIconOnly
            size='sm'
            variant='light'
            color='primary'
            data-open={isOpen}
            className='rotate-0 data-[open=true]:rotate-180'
            onPress={toggleOpen}
          >
            <ArrowDown style={{ width: 16, height: 16 }} />
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className='bg-content1 rounded-medium mr-2 mb-2 ml-2 flex flex-col justify-between gap-2 overflow-hidden p-2 sm:mr-3 sm:mb-3 sm:ml-3 sm:gap-3 sm:p-3'>
          <Call jsonFallback from={from} call={call} registry={registry} />
        </div>
      ) : null}
    </div>
  );
}

export default React.memo(BatchItem);

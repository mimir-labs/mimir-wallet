// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useApi } from '@/hooks/useApi';
import { Call, CallDisplayDetail } from '@/params';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/ui';

export type BatchItemType = BatchTxItem & {
  from: string;
  index: number;
  selected: (number | string)[];
  onSelected: (state: boolean) => void;
  onDelete: () => void;
  onCopy: () => void;
};

interface Props {
  children: React.ReactNode;
  actions?: React.ReactNode;
  calldata: HexString;
  from: string;
}

function BatchItem({ children, actions, from, calldata }: Props) {
  const { api } = useApi();
  const [isOpen, toggleOpen] = useToggle(false);

  const call = useMemo(() => {
    return api.createType('Call', calldata);
  }, [api, calldata]);

  return (
    <div data-open={isOpen} className='bg-secondary rounded-medium overflow-hidden'>
      <div className='grid grid-cols-6 cursor-pointer h-[44px] px-2 sm:px-3 text-small' onClick={toggleOpen}>
        {children}
        <div className='col-span-2 flex items-center'>
          <CallDisplayDetail fallbackWithName registry={api.registry} call={call} />
        </div>
        <div className='col-span-1 flex justify-between items-center'>
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
        <div className='flex flex-col justify-between gap-2 sm:gap-3 p-2 sm:p-3 ml-2 sm:ml-3 mb-2 sm:mb-3 mr-2 sm:mr-3 bg-content1 rounded-medium overflow-hidden'>
          <Call jsonFallback from={from} call={call} registry={api.registry} />
        </div>
      ) : null}
    </div>
  );
}

export default React.memo(BatchItem);

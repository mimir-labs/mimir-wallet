// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { Call, CallDisplayDetail } from '@/params';
import React, { useMemo } from 'react';

import { parseCall } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

interface BatchItemBaseProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  calldata: HexString;
  registry: Registry;
  from: string;
  bgcolor?: string;
  isOpen: boolean;
  onToggle: () => void;
}

function BatchItemBase({ children, actions, from, calldata, bgcolor, registry, isOpen, onToggle }: BatchItemBaseProps) {
  const call = useMemo(() => {
    return parseCall(registry, calldata);
  }, [registry, calldata]);

  if (!call) {
    return null;
  }

  return (
    <div
      data-open={isOpen}
      className='bg-secondary overflow-hidden rounded-[10px]'
      style={{ background: bgcolor }}
      role='article'
      aria-expanded={isOpen}
    >
      <div
        className='grid h-[44px] cursor-pointer grid-cols-6 px-2 text-sm sm:px-3'
        onClick={onToggle}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {children}
        <div className='col-span-2 flex items-center'>
          <span className='overflow-hidden text-ellipsis'>
            <CallDisplayDetail fallbackWithName registry={registry} call={call} />
          </span>
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
            onClick={onToggle}
            aria-label={isOpen ? 'Collapse details' : 'Expand details'}
          >
            <ArrowDown style={{ width: 16, height: 16 }} />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className='bg-content1 @container mr-2 mb-2 ml-2 flex flex-col justify-between gap-2 overflow-hidden rounded-[10px] p-2 sm:mr-3 sm:mb-3 sm:ml-3 sm:gap-3 sm:p-3'>
          <Call showFallback from={from} call={call} registry={registry} />
        </div>
      )}
    </div>
  );
}

export default React.memo(BatchItemBase);

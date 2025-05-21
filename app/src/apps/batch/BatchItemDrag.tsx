// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import Drag from '@/assets/images/drag.svg';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconCopy from '@/assets/svg/icon-add-copy.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import { AppName } from '@/components';
import { Call, CallDisplayDetail } from '@/params';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Checkbox, Tooltip } from '@mimir-wallet/ui';

export type Props = BatchTxItem & {
  from: string;
  index: number;
  selected: (number | string)[];
  onSelected: (state: boolean) => void;
  onDelete: () => void;
  onCopy: () => void;
};

function BatchItemDrag({
  from,
  calldata,
  website,
  iconUrl,
  appName,
  id,
  index,
  selected,
  onSelected,
  onDelete,
  onCopy
}: Props) {
  const { api } = useApi();
  const [isOpen, toggleOpen] = useToggle(false);

  const call = useMemo(() => {
    return api.createType('Call', calldata);
  }, [api, calldata]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, scaleY: transform.scaleX } : null),
    transition
  };

  return (
    <div
      key={id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-open={isOpen}
      data-dragging={isDragging}
      className='bg-secondary data-[dragging=true]:bg-primary-50 rounded-medium overflow-hidden'
    >
      <div className='grid grid-cols-6 cursor-pointer h-[44px] px-2 sm:px-3 text-small' onClick={toggleOpen}>
        <div className='col-span-1 flex items-center' onClick={(e) => e.stopPropagation()}>
          <img {...listeners} src={Drag} style={{ cursor: 'grab', padding: 10, marginLeft: -10, userSelect: 'none' }} />
          <Checkbox
            size='sm'
            isSelected={selected.includes(id)}
            onValueChange={(checked) => {
              onSelected(checked);
            }}
          >
            {index + 1}
          </Checkbox>
        </div>

        <div className='col-span-2 flex items-center'>
          <AppName website={website} iconUrl={iconUrl} appName={appName} />
        </div>

        <div className='col-span-2 flex items-center'>
          <CallDisplayDetail fallbackWithName registry={api.registry} call={call} />
        </div>

        <div className='col-span-1 flex justify-between items-center'>
          <div className='flex items-center gap-1'>
            <Tooltip content='Copy'>
              <Button isIconOnly variant='light' onPress={onCopy} size='sm' color='primary'>
                <IconCopy style={{ width: 14, height: 14 }} />
              </Button>
            </Tooltip>
            <Tooltip content='Delete'>
              <Button isIconOnly variant='light' onPress={onDelete} size='sm' color='danger'>
                <IconDelete style={{ width: 16, height: 16 }} />
              </Button>
            </Tooltip>
          </div>
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

export default React.memo(BatchItemDrag);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';
import type { Registry } from '@polkadot/types/types';

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

import { Button, Checkbox, Tooltip } from '@mimir-wallet/ui';

export type Props = BatchTxItem & {
  from: string;
  index: number;
  selected: (number | string)[];
  registry: Registry;
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
  registry,
  index,
  selected,
  onSelected,
  onDelete,
  onCopy
}: Props) {
  const [isOpen, toggleOpen] = useToggle(false);

  const call = useMemo(() => {
    try {
      return registry.createType('Call', calldata);
    } catch {
      return null;
    }
  }, [registry, calldata]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  if (!call) {
    return null;
  }

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
      className='bg-secondary data-[dragging=true]:bg-primary-50 overflow-hidden rounded-[10px]'
    >
      <div className='grid h-[44px] cursor-pointer grid-cols-6 px-2 text-sm sm:px-3' onClick={toggleOpen}>
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
          <CallDisplayDetail fallbackWithName registry={registry} call={call} />
        </div>

        <div className='col-span-1 flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <Tooltip content='Copy'>
              <Button isIconOnly variant='light' onClick={onCopy} size='sm' color='primary'>
                <IconCopy style={{ width: '1em', height: '1em' }} />
              </Button>
            </Tooltip>
            <Tooltip content='Delete'>
              <Button isIconOnly variant='light' onClick={onDelete} size='sm' color='danger'>
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
            onClick={toggleOpen}
          >
            <ArrowDown style={{ width: 16, height: 16 }} />
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className='bg-content1 mr-2 mb-2 ml-2 flex flex-col justify-between gap-2 overflow-hidden rounded-[10px] p-2 sm:mr-3 sm:mb-3 sm:ml-3 sm:gap-3 sm:p-3'>
          <Call showFallback from={from} call={call} registry={registry} />
        </div>
      ) : null}
    </div>
  );
}

export default React.memo(BatchItemDrag);

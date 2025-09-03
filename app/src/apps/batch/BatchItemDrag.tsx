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
import React, { useCallback, useMemo } from 'react';
import { useToggle } from 'react-use';

import { parseCall } from '@mimir-wallet/polkadot-core';
import { Button, Checkbox, Tooltip } from '@mimir-wallet/ui';

export type Props = BatchTxItem & {
  from: string;
  index: number;
  selected: (number | string)[];
  registry: Registry;
  isSelectionDisabled?: boolean;
  disabledReason?: string;
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
  isSelectionDisabled = false,
  disabledReason,
  onSelected,
  onDelete,
  onCopy
}: Props) {
  const [isOpen, toggleOpen] = useToggle(false);

  const call = useMemo(() => {
    return parseCall(registry, calldata);
  }, [registry, calldata]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const isSelected = useMemo(() => selected.includes(id), [selected, id]);

  const handleSelection = useCallback(
    (checked: boolean) => {
      onSelected(checked);
    },
    [onSelected]
  );

  const handleCopy = useCallback(() => {
    onCopy();
  }, [onCopy]);

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  const handleToggle = useCallback(() => {
    toggleOpen();
  }, [toggleOpen]);

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

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
      data-disabled={isSelectionDisabled}
      className='bg-secondary data-[dragging=true]:bg-primary-50 overflow-hidden rounded-[10px] data-[disabled=true]:opacity-50'
    >
      <div className='grid h-[44px] cursor-pointer grid-cols-12 px-2 text-sm sm:px-3' onClick={handleToggle}>
        <div className='col-span-2 flex items-center' onClick={handleStopPropagation}>
          <img {...listeners} src={Drag} style={{ cursor: 'grab', padding: 10, marginLeft: -10, userSelect: 'none' }} />
          {disabledReason ? (
            <Tooltip content={disabledReason}>
              <div>
                <Checkbox
                  size='sm'
                  isSelected={isSelected}
                  isDisabled={isSelectionDisabled}
                  onValueChange={handleSelection}
                >
                  {index + 1}
                </Checkbox>
              </div>
            </Tooltip>
          ) : (
            <Checkbox
              size='sm'
              isSelected={isSelected}
              isDisabled={isSelectionDisabled}
              onValueChange={handleSelection}
            >
              {index + 1}
            </Checkbox>
          )}
        </div>

        <div className='col-span-3 flex items-center'>
          <AppName website={website} iconUrl={iconUrl} appName={appName} />
        </div>

        <div className='col-span-5 flex items-center'>
          <span className='overflow-hidden text-ellipsis'>
            <CallDisplayDetail fallbackWithName registry={registry} call={call} />
          </span>
        </div>

        <div className='col-span-2 flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <Tooltip content='Copy'>
              <Button isIconOnly variant='light' onClick={handleCopy} size='sm' color='primary'>
                <IconCopy style={{ width: '1em', height: '1em' }} />
              </Button>
            </Tooltip>
            <Tooltip content='Delete'>
              <Button isIconOnly variant='light' onClick={handleDelete} size='sm' color='danger'>
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
            onClick={handleToggle}
          >
            <ArrowDown style={{ width: 16, height: 16 }} />
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className='bg-content1 @container mr-2 mb-2 ml-2 flex flex-col justify-between gap-2 overflow-hidden rounded-[10px] p-2 sm:mr-3 sm:mb-3 sm:ml-3 sm:gap-3 sm:p-3'>
          <Call showFallback from={from} call={call} registry={registry} />
        </div>
      ) : null}
    </div>
  );
}

export default React.memo(BatchItemDrag);

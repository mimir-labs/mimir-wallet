// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import Drag from '@/assets/images/drag.svg';
import IconCopy from '@/assets/svg/icon-add-copy.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import { AppName } from '@/components';
import React from 'react';

import { Button, Checkbox } from '@mimir-wallet/ui';

import BatchItem from './BatchItem';

export type BatchItemType = BatchTxItem & {
  from: string;
  index: number;
  selected: (number | string)[];
  onSelected: (state: boolean) => void;
  onDelete: () => void;
  onCopy: () => void;
};

interface Props {
  item: BatchItemType;
  itemSelected: number;
  dragHandleProps: object;
}

function BatchItemDrag({
  item: { from, calldata, website, iconUrl, appName, id, index, selected, onSelected, onDelete, onCopy },
  dragHandleProps
}: Props) {
  return (
    <BatchItem
      from={from}
      calldata={calldata}
      actions={
        <div className='flex items-center gap-1'>
          <Button isIconOnly variant='light' onPress={onCopy} size='sm' color='primary'>
            <IconCopy style={{ width: 14, height: 14 }} />
          </Button>
          <Button isIconOnly variant='light' onPress={onDelete} size='sm' color='danger'>
            <IconDelete style={{ width: 16, height: 16 }} />
          </Button>
        </div>
      }
    >
      <div className='col-span-1 flex items-center' onClick={(e) => e.stopPropagation()}>
        <img
          src={Drag}
          style={{ cursor: 'pointer', padding: 10, marginLeft: -10, userSelect: 'none' }}
          {...dragHandleProps}
        />
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
    </BatchItem>
  );
}

export default React.memo(BatchItemDrag);

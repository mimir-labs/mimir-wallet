// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';

import Drag from '@/assets/images/drag.svg';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconCopy from '@/assets/svg/icon-add-copy.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import { AppName } from '@/components';
import { useApi } from '@/hooks/useApi';
import { Call, CallDisplayDetail } from '@/params';
import { Box, Checkbox, FormControlLabel, useMediaQuery, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/ui';

export type BatchItemType = BatchTxItem & {
  from: string;
  index: number;
  selected: number[];
  onSelected: (state: boolean) => void;
  onDelete: () => void;
  onCopy: () => void;
};

interface Props {
  item: BatchItemType;
  itemSelected: number;
  dragHandleProps: object;
}

function BatchItem({
  item: { from, calldata, website, iconUrl, appName, id, index, selected, onSelected, onDelete, onCopy },
  dragHandleProps
}: Props) {
  const { api } = useApi();
  const [isOpen, toggleOpen] = useToggle(false);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const call = useMemo(() => {
    return api.createType('Call', calldata);
  }, [api, calldata]);

  return (
    <Box data-open={isOpen} sx={{ bgcolor: 'secondary.main', borderRadius: 1, overflow: 'hidden' }}>
      <div className='grid grid-cols-6 cursor-pointer h-[44px] px-2 sm:px-3 text-small' onClick={toggleOpen}>
        <div className='col-span-1 flex items-center'>
          <Box
            component='img'
            src={Drag}
            sx={{ cursor: 'pointer', padding: 1, marginLeft: -1, userSelect: 'none' }}
            {...dragHandleProps}
          />
          <FormControlLabel
            control={
              <Checkbox
                sx={{ padding: { sm: 1, xs: 0.5 } }}
                size={downSm ? 'small' : 'medium'}
                checked={selected.includes(id)}
                onChange={(e) => onSelected(e.target.checked)}
              />
            }
            label={index + 1}
          />
        </div>
        <div className='col-span-2 flex items-center'>
          <AppName website={website} iconUrl={iconUrl} appName={appName} />
        </div>
        <div className='col-span-2 flex items-center'>
          <CallDisplayDetail fallbackWithName registry={api.registry} call={call} />
        </div>
        <div className='col-span-1 flex justify-between items-center'>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Button isIconOnly variant='light' onPress={onCopy} size='sm' color='primary'>
              <IconCopy style={{ width: 14, height: 14 }} />
            </Button>
            <Button isIconOnly variant='light' onPress={onDelete} size='sm' color='danger'>
              <IconDelete style={{ width: 16, height: 16 }} />
            </Button>
          </Box>
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: { sm: 1.2, xs: 0.8 },
            padding: { sm: 1.2, xs: 0.8 },
            marginLeft: { sm: 1.2, xs: 0.8 },
            marginBottom: { sm: 1.2, xs: 0.8 },
            marginRight: { sm: 1.2, xs: 0.8 },
            bgcolor: 'white',
            borderRadius: 1,
            overflowY: 'hidden'
          }}
        >
          <Call jsonFallback from={from} call={call} registry={api.registry} />
        </Box>
      ) : null}
    </Box>
  );
}

export default React.memo(BatchItem);

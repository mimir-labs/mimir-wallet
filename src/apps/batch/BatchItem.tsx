// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@mimir-wallet/hooks/types';

import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid2 as Grid,
  IconButton,
  SvgIcon,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import Drag from '@mimir-wallet/assets/images/drag.svg';
import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import IconCopy from '@mimir-wallet/assets/svg/icon-copy.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AppName } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks';
import { Call, CallDisplayDetail } from '@mimir-wallet/params';

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
      <Grid
        container
        sx={{ cursor: 'pointer', height: 44, paddingX: { sm: 1.2, xs: 0.8 }, fontSize: '0.875rem' }}
        columns={6}
        onClick={toggleOpen}
      >
        <Grid size={1} sx={{ display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
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
        </Grid>
        <Grid size={2} sx={{ display: 'flex', alignItems: 'center' }}>
          <AppName website={website} iconUrl={iconUrl} appName={appName} />
        </Grid>
        <Grid size={2} sx={{ display: 'flex', alignItems: 'center' }}>
          <CallDisplayDetail registry={api.registry} call={call} />
        </Grid>
        <Grid size={1} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <IconButton onClick={onCopy} size='small' color='primary' sx={{ padding: 0.4 }}>
              <SvgIcon component={IconCopy} inheritViewBox sx={{ width: 16, height: 16 }} />
            </IconButton>
            <IconButton onClick={onDelete} size='small' color='error' sx={{ padding: 0.4 }}>
              <SvgIcon component={IconDelete} inheritViewBox sx={{ width: 16, height: 16 }} />
            </IconButton>
          </Box>
          <IconButton
            size='small'
            color='primary'
            sx={{ transform: isOpen ? 'rotateZ(180deg)' : undefined, padding: 0.4, fontSize: '0.75rem' }}
          >
            <SvgIcon component={ArrowDown} inheritViewBox />
          </IconButton>
        </Grid>
      </Grid>

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

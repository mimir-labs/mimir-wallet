// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, SvgIcon } from '@mui/material';
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from 'reactflow';

import IconClock from '@mimir-wallet/assets/svg/icon-clock.svg?react';

function AddressEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data
}: EdgeProps<{ label?: string; color?: string; labelBgColor?: string; delay?: number }>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: data?.color }} />

      {data && (
        <EdgeLabelRenderer>
          <Box
            sx={{
              display: data.label ? 'flex' : 'none',
              alignItems: 'center',
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#ffcc00',
              minWidth: 40,
              height: 16,
              padding: '2px',
              borderRadius: '8px',
              fontSize: 10,
              fontWeight: 700,
              bgcolor: data.labelBgColor,
              color: 'white',
              gap: '2px'
            }}
          >
            {!!data.delay && <SvgIcon component={IconClock} inheritViewBox sx={{ fontSize: '0.75rem' }} />}
            <Box sx={{ flex: '1', textAlign: 'center' }}>{data.label}</Box>
          </Box>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default React.memo(AddressEdge);

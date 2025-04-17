// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconClock from '@/assets/svg/icon-clock.svg?react';
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from 'reactflow';

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
          <div
            style={{
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
              backgroundColor: data.labelBgColor,
              color: 'white',
              gap: '2px'
            }}
          >
            {!!data.delay && <IconClock className='w-3 h-3' />}
            <div className='flex-1 text-center'>{data.label}</div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default React.memo(AddressEdge);

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
}: EdgeProps<{
  tips?: { label?: string; delay?: number }[];
  color?: string;
}>) {
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

      {data && data.tips && data.tips.length > 0 && (
        <EdgeLabelRenderer>
          <div
            className='flex flex-col gap-[2px] p-[2px] rounded-medium min-w-[40px] text-[10px] font-bold'
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#ffcc00',
              height: data.tips.length * 18 + 2,
              backgroundColor: data.color,
              color: data.color
            }}
          >
            {data.tips.map((tip) => (
              <div key={tip.label} className='flex items-center h-[16px] p-[2px] gap-[2px] bg-white rounded-full'>
                {!!tip.delay && <IconClock className='w-3 h-3' />}
                <div className='flex-1 text-center'>{tip.label}</div>
              </div>
            ))}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default React.memo(AddressEdge);

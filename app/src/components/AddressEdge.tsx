// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconClock from '@/assets/svg/icon-clock.svg?react';
import { BaseEdge, type Edge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from '@xyflow/react';
import React from 'react';

function AddressEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data
}: EdgeProps<
  Edge<{
    tips?: { label?: string; delay?: number }[];
    color?: string;
    isDash?: boolean;
  }>
>) {
  const [edgePath] = getSmoothStepPath({
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
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: data?.color, strokeDasharray: data?.isDash ? '5 5' : undefined }}
      />

      {data && data.tips && data.tips.length > 0 && (
        <EdgeLabelRenderer>
          <div
            className='flex flex-col gap-[2px] p-[2px] rounded-medium min-w-[40px] text-[10px] font-bold'
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX + 60}px, ${targetY}px)`,
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

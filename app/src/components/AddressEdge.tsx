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
            className='rounded-medium flex min-w-[40px] flex-col gap-[2px] p-[2px] text-[10px] font-bold'
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
              <div key={tip.label} className='flex h-[16px] items-center gap-[2px] rounded-full bg-white p-[2px]'>
                {!!tip.delay && <IconClock className='h-3 w-3' />}
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

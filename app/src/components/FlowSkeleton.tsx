// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton } from '@mimir-wallet/ui';
import React from 'react';

interface FlowSkeletonProps {
  className?: string;
}

/**
 * A skeleton loader that mimics the xyflow node graph layout.
 * Used as loading placeholder for AddressOverview and TxOverview components.
 */
function FlowSkeleton({ className }: FlowSkeletonProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className || ''}`}
    >
      <div className="flex items-center gap-8">
        {/* Left nodes (children) */}
        <div className="flex flex-col gap-6">
          <Skeleton className="h-11 w-[180px] rounded-[10px]" />
          <Skeleton className="h-11 w-[180px] rounded-[10px]" />
        </div>

        {/* Connection line */}
        <div className="flex items-center">
          <Skeleton className="h-0.5 w-16 rounded-full" />
        </div>

        {/* Right node (parent) */}
        <Skeleton className="h-11 w-[180px] rounded-[10px]" />
      </div>
    </div>
  );
}

export default React.memo(FlowSkeleton);

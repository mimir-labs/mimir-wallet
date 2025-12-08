// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Skeleton } from '@mimir-wallet/ui';
import { Suspense, lazy } from 'react';

// Lazy load react-json-view to avoid loading on page init (~117KB)
const ReactJson = lazy(() => import('react-json-view'));

function JsonSkeleton() {
  return (
    <div className="space-y-1.5 font-mono text-sm">
      {/* Root brace */}
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">{'{'}</span>
      </div>
      {/* JSON key-value pairs */}
      <div className="ml-4 space-y-1.5">
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-16" />
          <span className="text-muted-foreground">:</span>
          <Skeleton className="h-3.5 w-24" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-12" />
          <span className="text-muted-foreground">:</span>
          <Skeleton className="h-3.5 w-32" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-20" />
          <span className="text-muted-foreground">:</span>
          <span className="text-muted-foreground">{'['}</span>
          <Skeleton className="h-3.5 w-8" />
          <span className="text-muted-foreground">{']'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-14" />
          <span className="text-muted-foreground">:</span>
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
      {/* Closing brace */}
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">{'}'}</span>
      </div>
    </div>
  );
}

function JsonView({
  data,
  displayDataTypes = false,
  displayObjectSize = false,
  collapseStringsAfterLength = 30,
  enableClipboard = false,
}: {
  data: any;
  displayDataTypes?: boolean;
  displayObjectSize?: boolean;
  collapseStringsAfterLength?: number;
  enableClipboard?: boolean;
}) {
  return (
    <Suspense fallback={<JsonSkeleton />}>
      <ReactJson
        style={{ width: '100%', overflow: 'auto', background: 'transparent' }}
        enableClipboard={enableClipboard}
        indentWidth={2}
        src={data}
        displayDataTypes={displayDataTypes}
        displayObjectSize={displayObjectSize}
        collapseStringsAfterLength={collapseStringsAfterLength}
        theme="summerfruit:inverted"
      />
    </Suspense>
  );
}

export default JsonView;

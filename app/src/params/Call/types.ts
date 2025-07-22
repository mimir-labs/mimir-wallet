// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { IMethod, Registry } from '@polkadot/types/types';

export type RenderState = 'initializing' | 'rendered' | 'empty';

export interface CallProps {
  displayType?: 'horizontal' | 'vertical';
  from?: string;
  call: Call | IMethod;
  registry: Registry;
  showFallback?: boolean;
  className?: string;
  fallbackComponent?: React.ComponentType<CallProps>;
}

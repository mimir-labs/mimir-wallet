// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type Position, useDraggableSquare } from '@mimir-wallet/ui';

interface UseDraggableFABOptions {
  initialPosition?: Position;
  size?: number;
  margin?: number;
}

const FAB_SIZE = 60;
const FAB_MARGIN = 8;

/**
 * @deprecated Use useDraggableSquare from @mimir-wallet/ui instead
 * This hook is kept for backward compatibility and will be removed in a future version
 */
export function useDraggableFAB({
  initialPosition,
  size = FAB_SIZE,
  margin = FAB_MARGIN
}: UseDraggableFABOptions = {}) {
  return useDraggableSquare<HTMLButtonElement>({
    initialPosition,
    size,
    margin
  });
}

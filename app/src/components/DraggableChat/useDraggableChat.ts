// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type Position, useDraggableRectangle } from '@mimir-wallet/ui';

interface UseDraggableChatOptions {
  initialPosition?: Position;
  width?: number;
  height?: number;
}

/**
 * @deprecated Use useDraggableRectangle from @mimir-wallet/ui instead
 * This hook is kept for backward compatibility and will be removed in a future version
 */
export function useDraggableChat({ initialPosition, width = 395, height = 600 }: UseDraggableChatOptions = {}) {
  // Provide default initial position if not specified
  const defaultPosition = initialPosition || { x: 100, y: 100 };

  return useDraggableRectangle<HTMLDivElement>({
    initialPosition: defaultPosition,
    width,
    height,
    margin: 0 // Chat windows use 0 margin
  });
}

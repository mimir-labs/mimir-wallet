// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type RefObject, useEffect, useState } from 'react';

/**
 * Custom hook to track the width of a DOM element using ResizeObserver
 * @param elementRef - React ref object pointing to the target element
 * @param defaultWidth - Default width to use before measurement (default: 200)
 * @returns Current width of the element in pixels
 */
export function useElementWidth(elementRef: RefObject<HTMLElement | null>, defaultWidth = 200): number {
  const [width, setWidth] = useState<number>(defaultWidth);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    // Observe size changes (external synchronization with DOM)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;

        if (newWidth > 0) {
          setWidth(newWidth);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef, defaultWidth]);

  return width;
}

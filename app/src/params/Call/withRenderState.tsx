// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Ref, RefObject } from 'react';
import type { RenderState } from './types';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to track whether a ref has rendered content
 * This helps determine when to show fallback components
 */
export function useRefState(ref: Ref<HTMLDivElement | null>): RenderState {
  const [renderState, setRenderState] = useState<RenderState>('initializing');
  const internalRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const currentElementRef = useRef<HTMLDivElement | null>(null);

  // Create a stable ref object to monitor
  const refObject: RefObject<HTMLDivElement | null> = typeof ref === 'object' && ref !== null ? ref : internalRef;

  const checkContent = useRef((element: HTMLDivElement) => {
    // Check if the element has any child nodes or non-empty text content
    const hasContent = element.children.length > 0 || element.textContent?.trim();

    setRenderState(hasContent ? 'rendered' : 'empty');
  });

  const setupObserver = useRef((element: HTMLDivElement) => {
    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Initial content check
    checkContent.current(element);

    // Create new MutationObserver
    observerRef.current = new MutationObserver(() => {
      checkContent.current(element);
    });

    // Start observing
    observerRef.current.observe(element, {
      childList: true,
      subtree: true,
      characterData: true
    });

    currentElementRef.current = element;
  });

  const cleanupObserver = useRef(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    currentElementRef.current = null;
    setRenderState('empty');
  });

  useEffect(() => {
    // Copy cleanup function to avoid stale closure
    const cleanup = cleanupObserver.current;

    // Check for ref changes periodically
    const checkRefChange = () => {
      const currentElement = refObject.current;

      // If element changed from what we're currently observing
      if (currentElement !== currentElementRef.current) {
        if (currentElement) {
          // New element available, set up observer
          setupObserver.current(currentElement);
        } else {
          // Element removed, clean up
          cleanupObserver.current();
        }
      }
    };

    // Initial check
    checkRefChange();

    // Set up periodic checking for ref changes
    const intervalId = setInterval(checkRefChange, 16); // ~60fps

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      cleanup();
    };
  }, [refObject]);

  return renderState;
}

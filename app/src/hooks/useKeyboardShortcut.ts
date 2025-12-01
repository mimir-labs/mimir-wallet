// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

export interface KeyboardShortcutOptions {
  // Enable/disable the shortcut
  enabled?: boolean;
  // Prevent default browser behavior
  preventDefault?: boolean;
  // Stop event propagation
  stopPropagation?: boolean;
}

/**
 * Custom hook to handle keyboard shortcuts with OS-specific modifier keys
 * @param key - The key to listen for (e.g., 'k', 'Enter')
 * @param callback - Function to call when shortcut is triggered
 * @param options - Optional configuration
 *
 * @example
 * ```tsx
 * useKeyboardShortcut('k', () => {
 *   console.log('Cmd/Ctrl + K pressed');
 * });
 * ```
 */
export function useKeyboardShortcut(key: string, callback: () => void, options: KeyboardShortcutOptions = {}) {
  const { enabled = true, preventDefault = true, stopPropagation = false } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the correct modifier key is pressed based on OS
      // macOS uses metaKey (Cmd), Windows/Linux use ctrlKey
      const isMac = navigator.userAgent.toLowerCase().includes('mac');
      const isModifierPressed = (isMac && event.metaKey) || (!isMac && event.ctrlKey);

      // Check if the target key matches (case insensitive)
      const isKeyPressed = event.key.toLowerCase() === key.toLowerCase();

      if (isModifierPressed && isKeyPressed) {
        if (preventDefault) {
          event.preventDefault();
        }

        if (stopPropagation) {
          event.stopPropagation();
        }

        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, enabled, preventDefault, stopPropagation]);
}

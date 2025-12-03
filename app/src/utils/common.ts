// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get the OS-specific keyboard shortcut text
 * @param key - The key to combine with the modifier (e.g., 'K', 'S')
 * @returns The formatted keyboard shortcut text (e.g., '⌘K' on macOS, 'Ctrl+K' on Windows/Linux)
 */
export function getKeyboardShortcut(key: string): string {
  const isMac = navigator.userAgent.toLowerCase().includes('mac');
  const modifierKey = isMac ? '⌘' : 'Ctrl+';

  return `${modifierKey}${key.toUpperCase()}`;
}

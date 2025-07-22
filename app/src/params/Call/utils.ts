// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Merge class names efficiently
 * @param baseClasses - The base CSS classes
 * @param additionalClassName - Additional className to append
 * @returns Merged class names
 */
export function mergeClasses(baseClasses: string, additionalClassName?: string): string {
  return additionalClassName ? `${baseClasses} ${additionalClassName}` : baseClasses;
}

// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';

/**
 * Hook to get the current timestamp once on component mount.
 *
 * This avoids calling Date.now() directly in useMemo/render which triggers
 * react-hooks/purity warnings. The timestamp is captured once when the
 * component mounts and remains stable across re-renders.
 *
 * @returns The timestamp (milliseconds since epoch) captured on mount
 */
export function useNow() {
  const [now] = useState(() => Date.now());

  return now;
}

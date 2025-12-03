// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from './useAccount';

export function useSelectedAccount(): string | undefined {
  return useAccount().current;
}

export function useSelectedAccountCallback(): (address: string, confirm?: boolean) => void {
  return useAccount().setCurrent;
}

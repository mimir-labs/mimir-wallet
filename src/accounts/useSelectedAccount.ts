// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createNamedHook } from '../hooks/createNamedHook';
import { useAccount } from './useAccount';

function useSelectedAccountImpl(): string | undefined {
  return useAccount().current;
}

function useSelectedAccountCallbackImpl(): (address: string, confirm?: boolean) => void {
  return useAccount().setCurrent;
}

export const useSelectedAccount = createNamedHook('useSelectedAccount', useSelectedAccountImpl);
export const useSelectedAccountCallback = createNamedHook('useSelectedAccountCallback', useSelectedAccountCallbackImpl);

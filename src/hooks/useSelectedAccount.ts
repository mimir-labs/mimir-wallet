// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { SelectAccountCtx } from './ctx/SelectedAccount';
import { createNamedHook } from './createNamedHook';

function useSelectedAccountImpl(): string | undefined {
  return useContext(SelectAccountCtx).selected;
}

function useSelectedAccountCallbackImpl(): (address: string) => void {
  return useContext(SelectAccountCtx).selectAccount;
}

export const useSelectedAccount = createNamedHook('useSelectedAccount', useSelectedAccountImpl);
export const useSelectedAccountCallback = createNamedHook('useSelectedAccountCallback', useSelectedAccountCallbackImpl);

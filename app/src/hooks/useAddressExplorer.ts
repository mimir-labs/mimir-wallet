// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

export const useAddressExplorer = create<{
  isOpen: boolean;
  address: string;
  open: (address: string) => void;
  close: () => void;
}>()((set) => ({
  isOpen: false,
  address: '',
  open: (address: { toString: () => string }) => set({ isOpen: true, address: address.toString() }),
  close: () => set({ isOpen: false })
}));

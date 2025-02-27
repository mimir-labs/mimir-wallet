// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

interface MimirLayoutState {
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  rightSidebarElement: React.ReactNode;
  openSidebar: () => void;
  closeSidebar: () => void;
  openRightSidebar: (element: React.ReactNode) => void;
  closeRightSidebar: () => void;
}

export const useMimirLayout = create<MimirLayoutState>()((set) => ({
  sidebarOpen: false,
  rightSidebarOpen: false,
  rightSidebarElement: null,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  openRightSidebar: (element: React.ReactNode) => set({ rightSidebarOpen: true, rightSidebarElement: element }),
  closeRightSidebar: () => set({ rightSidebarOpen: false })
}));

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

'use client';

import { create } from 'zustand';

type RightSidebarTab = 'batch' | 'template' | 'decoder';

type RightSidebarState = {
  tab: 'batch' | 'template' | 'decoder';
};

interface MimirLayoutState {
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  rightSidebarState: RightSidebarState;
  openSidebar: () => void;
  closeSidebar: () => void;
  openRightSidebar: () => void;
  closeRightSidebar: () => void;
  setRightSidebarTab: (tab: RightSidebarTab) => void;
}

// Get initial sidebar state based on screen width
const getInitialSidebarState = () => {
  if (typeof window === 'undefined') {
    return { sidebarOpen: true, rightSidebarOpen: false };
  }

  const screenWidth = window.innerWidth;

  if (screenWidth < 1024) {
    // Small screens: close both sidebars
    return { sidebarOpen: false, rightSidebarOpen: false };
  } else if (screenWidth > 1700) {
    // Large screens: open both sidebars
    return { sidebarOpen: true, rightSidebarOpen: true };
  } else {
    // Medium screens: only open left sidebar
    return { sidebarOpen: true, rightSidebarOpen: false };
  }
};

export const useMimirLayout = create<MimirLayoutState>()((set) => {
  const initialState = getInitialSidebarState();

  return {
    sidebarOpen: initialState.sidebarOpen,
    rightSidebarOpen: initialState.rightSidebarOpen,
    rightSidebarState: { tab: 'batch' },
    openSidebar: () => set({ sidebarOpen: true }),
    closeSidebar: () => set({ sidebarOpen: false }),
    openRightSidebar: () => set({ rightSidebarOpen: true }),
    closeRightSidebar: () => set({ rightSidebarOpen: false }),
    setRightSidebarTab: (tab: RightSidebarTab) => {
      set((state) => ({
        rightSidebarState: { ...state.rightSidebarState, tab }
      }));
    }
  };
});

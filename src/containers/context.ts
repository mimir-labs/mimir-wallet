// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContext } from 'react';

export interface State {
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  rightSidebarElement: React.ReactNode;
  openSidebar: () => void;
  closeSidebar: () => void;
  openRightSidebar: () => void;
  closeRightSidebar: () => void;
  setRightSidebarElement: (element: React.ReactNode) => void;
}

export const BaseContainerCtx = createContext<State>({} as State);

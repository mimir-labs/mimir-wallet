// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContext } from 'react';

export interface State {
  sidebarOpen: boolean;
  alertOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const BaseContainerCtx = createContext<State>({} as State);

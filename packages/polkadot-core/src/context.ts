// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiContextProps } from './types.js';

import { createContext } from 'react';

export const ApiContext = createContext<ApiContextProps>({} as ApiContextProps);

export const SubApiContext = createContext<ApiContextProps | undefined>(undefined);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressState, TxState, TxToastInterface, WalletState } from './types';

import React from 'react';

export const AddressCtx = React.createContext<AddressState>({} as AddressState);
export const WalletCtx = React.createContext<WalletState>({} as WalletState);
export const TxQueueCtx = React.createContext<TxState>({} as TxState);
export const TxToastCtx = React.createContext<TxToastInterface>({} as TxToastInterface);

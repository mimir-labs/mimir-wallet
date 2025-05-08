// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { TransactionSocketContext } from './context.js';

export const useTransactionSocket = () => {
  const context = useContext(TransactionSocketContext);

  if (!context) {
    throw new Error('useTransactionSocket must be used within a TransactionSocketProvider');
  }

  return context;
};

// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ToastNotification from './ToastNotification';

import { useTxQueue } from '@/hooks/useTxQueue';

function TxToast() {
  const { toasts } = useTxQueue();

  return toasts.map(({ events, id, onRemove }) => (
    <ToastNotification events={events} key={id} onRemove={onRemove} />
  ));
}

export default TxToast;

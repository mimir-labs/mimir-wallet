// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTxQueue } from '@/hooks/useTxQueue';

import ToastNotification from './ToastNotification';

function TxToast() {
  const { toasts } = useTxQueue();

  return toasts.map(({ events, id, onRemove }) => <ToastNotification events={events} key={id} onRemove={onRemove} />);
}

export default TxToast;

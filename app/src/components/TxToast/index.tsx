// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTxQueue } from '@/hooks/useTxQueue';

import ToastDialog from './ToastDialog';
import ToastNotification from './ToastNotification';

function TxToast() {
  const { toasts } = useTxQueue();

  return toasts.map(({ events, id, onChange, onRemove, style }) =>
    style === 'notification' ? (
      <ToastNotification events={events} key={id} onRemove={onRemove} />
    ) : (
      <ToastDialog events={events} key={id} onChange={onChange || onRemove} onRemove={onRemove} />
    )
  );
}

export default TxToast;

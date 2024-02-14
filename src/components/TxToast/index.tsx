// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TxToastCtx } from '@mimir-wallet/hooks';
import React, { useContext } from 'react';

import ToastDialog from './ToastDialog';
import ToastNotification from './ToastNotification';

function TxToast() {
  const { state } = useContext(TxToastCtx);

  return state.map(({ events, id, onChange, onRemove, style }) =>
    style === 'notification' ? <ToastNotification events={events} key={id} onRemove={onRemove} /> : <ToastDialog events={events} key={id} onChange={onChange || onRemove} onRemove={onRemove} />
  );
}

export default TxToast;

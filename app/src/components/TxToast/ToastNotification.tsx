// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxEvents } from '@mimir-wallet/polkadot-core';

import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import FailedAnimation from '../animation/Failed';
import SuccessAnimation from '../animation/Success';
import WaitingAnimation from '../animation/Waiting';
import TxError from '../TxError';

function toastCustom(events: TxEvents, id?: number | string) {
  if (
    events.status === 'inblock' ||
    events.status === 'finalized' ||
    events.status === 'completed' ||
    events.status === 'success'
  ) {
    return toast.success(
      <div className='flex flex-col gap-1'>
        <p className='font-bold'>Waiting</p>
        <p className='text-xs'>Transaction is inblock</p>
      </div>,
      {
        id,
        icon: <SuccessAnimation />,
        duration: 3000
      }
    );
  }

  if (events.status === 'signed') {
    return toast.warning(
      <div className='flex flex-col gap-1'>
        <p className='font-bold'>Waiting</p>
        <p className='text-xs'>Transaction is inblock</p>
      </div>,
      {
        id,
        icon: <WaitingAnimation />,
        duration: 9999999
      }
    );
  }

  if (events.status === 'error') {
    return toast.error(
      <div className='flex flex-col gap-1'>
        <p className='font-bold'>Failed</p>
        <p className='text-xs'>
          <TxError error={events.error} />
        </p>
      </div>,
      {
        id,
        icon: <FailedAnimation />,
        duration: 3000
      }
    );
  }

  return toast.warning(
    <div className='flex flex-col gap-1'>
      <p className='font-bold'>Waiting</p>
      <p className='text-xs'>Waiting for sign</p>
    </div>,
    {
      id,
      icon: <WaitingAnimation />,
      duration: 9999999
    }
  );
}

function ToastNotification({ events, onRemove }: { events: TxEvents; onRemove: () => void }) {
  const idRef = useRef<number | string>();

  useEffect(() => {
    let id: number | string;

    if (idRef.current) {
      id = idRef.current;
    } else {
      idRef.current = toastCustom(events);
      id = idRef.current;
    }

    const onInblock = () => {
      idRef.current = toastCustom(events, id);
    };

    const onSign = () => {
      idRef.current = toastCustom(events, id);
    };

    const onSuccess = () => {
      idRef.current = toastCustom(events, id);
    };

    const onError = () => {
      idRef.current = toastCustom(events, id);
    };

    events.on('signed', onSign).on('inblock', onInblock).on('success', onSuccess).on('error', onError);

    return () => {
      events.off('signed', onSign);
      events.off('inblock', onInblock);
      events.off('success', onSuccess);
      events.off('error', onError);
    };
  }, [events, onRemove]);

  return null;
}

export default React.memo(ToastNotification);

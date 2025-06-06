// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxEvents } from '@mimir-wallet/polkadot-core';

import React, { useEffect, useRef } from 'react';
import { toast, type ToastOptions } from 'react-toastify';

import FailedAnimation from '../animation/Failed';
import SuccessAnimation from '../animation/Success';
import WaitingAnimation from '../animation/Waiting';
import TxError from '../TxError';

function getToastContent(events: TxEvents): [() => React.ReactNode, ToastOptions] {
  if (
    events.status === 'inblock' ||
    events.status === 'finalized' ||
    events.status === 'completed' ||
    events.status === 'success'
  ) {
    return [
      () => (
        <div className='flex flex-col gap-1'>
          <p className='font-bold'>Waiting</p>
          <p className='text-tiny'>Transaction is inblock</p>
        </div>
      ),
      { type: 'success', icon: <SuccessAnimation />, autoClose: 3000 }
    ];
  }

  if (events.status === 'signed') {
    return [
      () => (
        <div className='flex flex-col gap-1'>
          <p className='font-bold'>Waiting</p>
          <p className='text-tiny'>Broadcasting transaction</p>
        </div>
      ),
      { icon: <WaitingAnimation />, autoClose: false }
    ];
  }

  if (events.status === 'error') {
    return [
      () => (
        <div className='flex flex-col gap-1'>
          <p className='font-bold'>Failed</p>
          <p className='text-tiny'>
            <TxError error={events.error} />
          </p>
        </div>
      ),
      {
        type: 'error',
        autoClose: 3000,
        icon: <FailedAnimation />
      }
    ];
  }

  return [
    () => (
      <div className='flex flex-col gap-1'>
        <p className='font-bold'>Waiting</p>
        <p className='text-tiny'>Waiting for sign</p>
      </div>
    ),
    { icon: <WaitingAnimation />, autoClose: false }
  ];
}

function ToastNotification({ events, onRemove }: { events: TxEvents; onRemove: () => void }) {
  const idRef = useRef<number | string>();

  useEffect(() => {
    let id: number | string;

    if (idRef.current) {
      id = idRef.current;
    } else {
      const [content, options] = getToastContent(events);

      idRef.current = toast.warn(content, options);
      id = idRef.current;
    }

    const onInblock = () => {
      const [content, options] = getToastContent(events);

      toast.update(id, {
        ...options,
        render: content
      });
    };

    const onSign = () => {
      const [content, options] = getToastContent(events);

      toast.update(id, {
        ...options,
        render: content
      });
    };

    const onSuccess = () => {
      const [content, options] = getToastContent(events);

      toast.update(id, {
        ...options,
        render: content
      });
    };

    const onError = () => {
      const [content, options] = getToastContent(events);

      toast.update(id, {
        ...options,
        render: content
      });
    };

    events.on('signed', onSign).on('inblock', onInblock).on('success', onSuccess).on('error', onError);

    toast.onChange((item) => {
      if (id === item.id && item.status === 'removed') {
        onRemove();
      }
    });

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

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxEvents } from '@mimir-wallet/polkadot-core';

import { Box, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { toast, type ToastOptions } from 'react-toastify';

import FailedAnimation from '../animation/Failed';
import SuccessAnimation from '../animation/Success';
import WaitingAnimation from '../animation/Waiting';
import TxError from '../TxError';

function getToastContent(events: TxEvents): [() => React.ReactNode, ToastOptions] {
  if (events.status === 'inblock') {
    return [
      () => (
        <Box marginLeft={1.5}>
          <Typography fontWeight={700}>Waiting</Typography>
          <Typography fontSize={12}>Transaction is inblock</Typography>
        </Box>
      ),
      { icon: <WaitingAnimation />, autoClose: false }
    ];
  }

  if (events.status === 'finalized') {
    return [
      () => (
        <Box marginLeft={1.5}>
          <Typography fontWeight={700}>Success</Typography>
          <Typography fontSize={12}>Transaction finalized</Typography>
        </Box>
      ),
      {
        type: 'success',
        autoClose: 3000,
        icon: <SuccessAnimation />
      }
    ];
  }

  if (events.status === 'signed') {
    return [
      () => (
        <Box marginLeft={1.5}>
          <Typography fontWeight={700}>Waiting</Typography>
          <Typography fontSize={12}>Broadcasting transaction</Typography>
        </Box>
      ),
      { icon: <WaitingAnimation />, autoClose: false }
    ];
  }

  if (events.status === 'success') {
    return [
      () => (
        <Box marginLeft={1.5}>
          <Typography fontWeight={700}>Success</Typography>
          <Typography fontSize={12}>{events.message || 'Operation success'}</Typography>
        </Box>
      ),
      {
        type: 'success',
        autoClose: 3000,
        icon: <SuccessAnimation />
      }
    ];
  }

  if (events.status === 'error') {
    return [
      () => (
        <Box marginLeft={1.5}>
          <Typography fontWeight={700}>Failed</Typography>
          <Typography fontSize={12}>
            <TxError error={events.error} />
          </Typography>
        </Box>
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
      <Box marginLeft={1.5}>
        <Typography fontWeight={700}>Waiting</Typography>
        <Typography fontSize={12}>Waiting for sign</Typography>
      </Box>
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

    const onFinalized = () => {
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

    events
      .on('signed', onSign)
      .on('inblock', onInblock)
      .on('finalized', onFinalized)
      .on('error', onError)
      .on('success', onSuccess);

    toast.onChange((item) => {
      if (id === item.id && item.status === 'removed') {
        onRemove();
      }
    });

    return () => {
      events.off('signed', onSign);
      events.off('inblock', onInblock);
      events.off('finalized', onFinalized);
      events.off('error', onError);
    };
  }, [events, onRemove]);

  return null;
}

export default React.memo(ToastNotification);

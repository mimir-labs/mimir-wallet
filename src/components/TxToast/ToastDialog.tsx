// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxEvents } from '@mimir-wallet/utils';
import type { ISubmittableResult } from '@polkadot/types/types';

import ImgTxFailed from '@mimir-wallet/assets/images/tx-failed.png';
import ImgTxPending from '@mimir-wallet/assets/images/tx-pending.png';
import ImgTxSuccess from '@mimir-wallet/assets/images/tx-success.png';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { HexString } from '@polkadot/util/types';
import React, { useEffect, useState } from 'react';

import TxError from '../TxError';

function ToastDialog({ events, onChange, onRemove }: { onRemove: () => void; events: TxEvents; onChange: () => void }) {
  const [img, setImg] = useState(ImgTxPending);
  const [text, setText] = useState<React.ReactNode>('Waiting for sign');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [txHash, setTxHash] = useState<HexString>();

  useEffect(() => {
    const onInblock = (result: ISubmittableResult) => {
      setTxHash(result.txHash.toHex());

      setImg(ImgTxPending);
      setText('Transaction is inblock');
      setStatus('pending');
    };

    const onSign = () => {
      setImg(ImgTxPending);
      setText('Boardcasting transaction');
      setStatus('pending');
    };

    const onFinalized = (result: ISubmittableResult) => {
      setTxHash(result.txHash.toHex());

      setImg(ImgTxSuccess);
      setText('Transaction finalized');
      setStatus('success');
    };

    const onSuccess = (message?: string) => {
      setImg(ImgTxSuccess);
      setText(message || 'Operation success');
      setStatus('success');
    };

    const onError = (error: unknown) => {
      setImg(ImgTxFailed);
      setText(<TxError error={error} />);
      setStatus('error');
    };

    events.on('signed', onSign).on('inblock', onInblock).on('finalized', onFinalized).on('error', onError).on('success', onSuccess);

    return () => {
      events.off('signed', onSign);
      events.off('inblock', onInblock);
      events.off('finalized', onFinalized);
      events.off('error', onError);
    };
  });

  const handleClose = () => {
    if (events.status === 'error' || events.status === 'finalized' || events.status === 'success') {
      onRemove();
    } else {
      onChange();
    }
  };

  return (
    <Dialog maxWidth='xs' onClose={handleClose} open>
      <DialogTitle sx={{ textAlign: 'center' }}>Submit Transaction</DialogTitle>
      <DialogContent sx={{ width: 360, maxWidth: '100%' }}>
        <Stack alignItems='center' spacing={1}>
          <Box component='img' src={img} sx={{ width: 70 }} />
          <Typography>{text}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={handleClose} sx={{ borderRadius: '18px' }} variant='outlined'>
          Close
        </Button>
        {status === 'success' && txHash && (
          <Button fullWidth sx={{ borderRadius: '18px' }} variant='outlined'>
            View on explorer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(ToastDialog);

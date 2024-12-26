// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Avatar, Box, Dialog, DialogContent, Typography } from '@mui/material';
import qrcode from 'qrcode-generator';
import React, { useEffect, useRef } from 'react';

import { useApi } from '@mimir-wallet/hooks/useApi';

import CopyButton from './CopyButton';

interface Props {
  open: boolean;
  onClose?: () => void;
  value: AccountId | AccountIndex | Address | string | Uint8Array | null | undefined;
}

function Content({ value }: { value: string }) {
  const { chain } = useApi();
  const qr = useRef(qrcode(0, 'M'));
  const container = useRef<HTMLDivElement>();

  useEffect(() => {
    setTimeout(() => {
      qr.current = qrcode(0, 'M');

      qr.current.addData(value);
      qr.current.make();

      if (container.current) container.current.innerHTML = qr.current.createImgTag(7);
    }, 100);
  }, [value]);

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <Box
          ref={container}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            width: 300,
            height: 300
          }}
        />
        <Avatar
          src={chain.icon}
          sx={{ width: 50, height: 50, margin: 'auto', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
      </Box>
      <Typography marginTop={1} textAlign='center' sx={{ wordBreak: 'break-all' }}>
        {value}
        <CopyButton value={value} />
      </Typography>
    </Box>
  );
}

function QrcodeAddress({ onClose, open, value }: Props) {
  return (
    <Dialog fullWidth maxWidth='xs' onClose={onClose} open={open}>
      <DialogContent>
        <Content value={value?.toString() || ''} />
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(QrcodeAddress);

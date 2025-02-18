// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Avatar, Box, Dialog, DialogContent, Tab, Tabs, Typography } from '@mui/material';
import qrcode from 'qrcode-generator';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
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
  const [tab, setTab] = useState('unified'); // unified or original
  const { chain, chainSS58 } = useApi();

  const unifiedValue = useMemo(
    () => encodeAddress(value, chain.relayChainSs58Format ?? chain.ss58Format),
    [value, chain.relayChainSs58Format, chain.ss58Format]
  );
  const originalValue = useMemo(() => encodeAddress(value, chain.ss58Format), [value, chain.ss58Format]);
  const valueString = useMemo(() => encodeAddress(value, chainSS58), [value, chainSS58]);

  return (
    <Dialog fullWidth maxWidth='xs' onClose={onClose} open={open}>
      <DialogContent>
        {chain.relayChainSs58Format !== undefined ? (
          <>
            <Tabs variant='fullWidth' onChange={(_, value) => setTab(value)} value={tab}>
              <Tab value='unified' label='Unified Format' />
              <Tab value='original' label='Original Format' />
            </Tabs>

            {tab === 'unified' && chain.relayChainSs58Format !== undefined && <Content value={unifiedValue} />}
            {tab === 'original' && <Content value={originalValue} />}
          </>
        ) : (
          <Content value={valueString} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(QrcodeAddress);

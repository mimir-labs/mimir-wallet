// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Paper, useMediaQuery, useTheme } from '@mui/material';
import React, { useRef } from 'react';

import { AddressOverview } from '@mimir-wallet/components';
import { useQueryAccount } from '@mimir-wallet/hooks';

function Relation({ address }: { address: string }) {
  const [account] = useQueryAccount(address);
  const ref = useRef<HTMLDivElement>(null);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const enterFullscreen = () => {
    if (!ref.current) return;

    if (ref.current.requestFullscreen) {
      ref.current.requestFullscreen();
    }
  };

  function lockOrientation() {
    (window.screen.orientation as any)?.lock?.('landscape');
  }

  return (
    <Paper
      ref={ref}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 360,
        height: { sm: 'calc(100dvh - 400px)', xs: 'calc(100dvh - 500px)' },
        borderRadius: 2
      }}
    >
      <Button
        variant='text'
        sx={{ display: { sm: 'none', xs: 'inline-flex' }, zIndex: 1, position: 'absolute' }}
        onClick={() => {
          enterFullscreen();
          lockOrientation();
        }}
      >
        Overview
      </Button>
      <AddressOverview
        key={account?.address || 'none'}
        account={account}
        showControls={!downSm}
        showMiniMap={!downSm}
      />
    </Paper>
  );
}

export default React.memo(Relation);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueryAccount } from '@/accounts/useQueryAccount';
import IconClose from '@/assets/svg/icon-close.svg?react';
import { AddressOverview } from '@/components';
import { Box, Button, Dialog, DialogContent, IconButton, Paper, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';

function Relation({ address }: { address: string }) {
  const [account] = useQueryAccount(address);
  const ref = useRef<HTMLDivElement>(null);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <>
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
          onClick={toggleOpen}
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
      <Dialog fullScreen open={isOpen} onClose={toggleOpen}>
        <IconButton
          color='inherit'
          sx={{ zIndex: 1, position: 'absolute', right: 16, top: 16 }}
          onClick={() => {
            toggleOpen(false);
          }}
        >
          <SvgIcon component={IconClose} inheritViewBox />
        </IconButton>
        <DialogContent>
          <Box sx={{ width: '100%', height: '100%' }}>
            <AddressOverview key={account?.address || 'none'} account={account} showControls showMiniMap={false} />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default React.memo(Relation);

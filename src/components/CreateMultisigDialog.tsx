// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import NormalImg from '@mimir-wallet/assets/images/normal.webp';
import OneOfOneImg from '@mimir-wallet/assets/images/oneofone.webp';

function CreateMultisigDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog maxWidth='sm' fullWidth open={open} onClose={onClose}>
      <DialogTitle>Select Multisig Account Type</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: { sm: 'row', xs: 'column' },
          gap: 2,
          '&>a': {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            padding: 1,
            paddingTop: 2,
            bgcolor: 'secondary.main',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'text.primary'
          }
        }}
      >
        <Box component={Link} onClick={onClose} to='/create-multisig'>
          <img style={{ borderRadius: 25 }} src={NormalImg} width={50} height={50} alt='normal multisig' />
          <Typography variant='h4'>Normal Multisig</Typography>
          <Box sx={{ width: '100%' }}>Multisig with {'Threshold > 1'}</Box>
        </Box>
        <Box component={Link} onClick={onClose} to='/create-multisig-one'>
          <img style={{ borderRadius: 25 }} src={OneOfOneImg} width={50} height={50} alt='normal multisig' />
          <Typography variant='h4'>1/N Multisig</Typography>
          <Box sx={{ width: '100%' }}>Multisig with Threshold = 1</Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(CreateMultisigDialog);

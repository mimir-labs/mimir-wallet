// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { allEndpoints, type Endpoint } from '@/config';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material';
import React, { useMemo } from 'react';

interface Props {
  network: string;
  open: boolean;
  onClose: () => void;
  onOpen: (network: Endpoint) => void;
}

function SwitchChain({ network, onClose, onOpen, open }: Props) {
  const endpoint = useMemo(() => allEndpoints.find((item) => item.key === network), [network]);

  return (
    <Dialog fullWidth maxWidth='xs' onClose={onClose} open={open}>
      <DialogTitle>Switch Network</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            This app has been migrated to the {endpoint?.name}. To continue using it, please switch to the following
            network.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              padding: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'secondary.main'
            }}
          >
            <Avatar sx={{ width: 20, height: 20 }} src={endpoint?.icon} />
            {endpoint?.name}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button fullWidth size='large' onClick={endpoint ? () => onOpen(endpoint) : undefined}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(SwitchChain);

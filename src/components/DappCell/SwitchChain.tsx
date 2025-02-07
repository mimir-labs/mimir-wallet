// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

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

import { type Endpoint, findEndpoint } from '@mimir-wallet/config';

interface Props {
  genesisHash: HexString;
  open: boolean;
  onClose: () => void;
  onOpen: (network: Endpoint) => void;
}

function SwitchChain({ genesisHash, onClose, onOpen, open }: Props) {
  const endpoint = useMemo(() => findEndpoint(genesisHash), [genesisHash]);

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

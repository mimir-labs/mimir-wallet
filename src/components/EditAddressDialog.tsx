// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React from 'react';

import { useAddressMeta } from '@mimir-wallet/hooks';

import Input from './Input';
import { toastSuccess } from './ToastRoot';

function Content({ address, onClose }: { address: string; onClose?: () => void }) {
  const { name, saveName, setName } = useAddressMeta(address);

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Input label='Name' onChange={setName} placeholder='input name for contact' value={name} />
          <Input disabled label='Address' placeholder='input address' value={address} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <Button
          disabled={!name || !address}
          fullWidth
          onClick={() => {
            onClose?.();
            saveName((name) => toastSuccess(`Save name to ${name} success`));
          }}
          variant='contained'
        >
          Save
        </Button>
      </DialogActions>
    </>
  );
}

function AddAddressDialog({ address, onClose, open }: { address: string; open: boolean; onClose?: () => void }) {
  return (
    <Dialog fullWidth maxWidth='sm' onClick={(e) => e.stopPropagation()} onClose={onClose} open={open}>
      <DialogTitle>
        <Typography variant='h4'>Edit Name</Typography>
      </DialogTitle>
      <Content address={address} onClose={onClose} />
    </Dialog>
  );
}

export default React.memo(AddAddressDialog);

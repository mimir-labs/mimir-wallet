// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import React, { useCallback, useState } from 'react';

import { Input } from '@mimirdev/react-components';
import { useToggle } from '@mimirdev/react-hooks';

function AddAddress() {
  const [open, toggleOpen] = useToggle();
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const _onChangeAddress = useCallback((addressInput: string) => {
    let address = '';

    try {
      const publicKey = keyring.decodeAddress(addressInput);

      address = keyring.encodeAddress(publicKey);
      setAddress(address);
    } catch {
      setAddress(addressInput);
    }
  }, []);

  const _onCommit = useCallback((): void => {
    try {
      keyring.saveAddress(address, { name: name.trim() });
    } catch {}

    toggleOpen();
  }, [address, name, toggleOpen]);

  return (
    <>
      <Button onClick={toggleOpen} variant='outlined'>
        Add New Contact
      </Button>
      <Dialog maxWidth='sm' onClose={toggleOpen} open={open}>
        <DialogTitle>
          <Typography textAlign='center' variant='h4'>
            Add New Contact
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ width: 600 }}>
          <Stack spacing={2.5}>
            <Input label='Name' onChange={setName} placeholder='input name for contact' value={name} />
            <Input label='Address' onChange={_onChangeAddress} placeholder='input address' value={address} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={_onCommit} variant='contained'>
            Save
          </Button>
          <Button onClick={toggleOpen} variant='outlined'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(AddAddress);

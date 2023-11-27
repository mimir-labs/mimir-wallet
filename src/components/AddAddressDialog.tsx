// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import React, { useCallback, useState } from 'react';

import Input from './Input';

function AddAddressDialog({ address: propAddress, onAdded, onClose, open }: { address?: string; open: boolean; onAdded?: (address: string) => void; onClose?: () => void }) {
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
      const _address = propAddress || address;

      keyring.saveAddress(_address, { name: name.trim() });
      onAdded?.(_address);
    } catch {}

    onClose?.();
  }, [address, name, onAdded, onClose, propAddress]);

  return (
    <Dialog fullWidth maxWidth='sm' onClose={onClose} open={open}>
      <DialogTitle>
        <Typography textAlign='center' variant='h4'>
          Add New Contact
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2}>
          <Input label='Name' onChange={setName} placeholder='input name for contact' value={name} />
          <Input label='Address' onChange={_onChangeAddress} placeholder='input address' value={propAddress || address} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={_onCommit} variant='contained'>
          Save
        </Button>
        <Button fullWidth onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(AddAddressDialog);

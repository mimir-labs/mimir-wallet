// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import React, { useCallback, useState } from 'react';

import Input from './Input';

function AddAddressDialog({ defaultAddress, onAdded, onClose, open }: { defaultAddress?: string; open: boolean; onAdded?: (address: string) => void; onClose?: () => void }) {
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string | undefined>(defaultAddress);

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
      if (!address) return;

      keyring.saveAddress(address, { name: name.trim() });
      onAdded?.(address);
    } catch {}

    onClose?.();
  }, [address, name, onAdded, onClose]);

  return (
    <Dialog fullWidth maxWidth='sm' onClick={(e) => e.stopPropagation()} onClose={onClose} open={open}>
      <DialogTitle>
        <Typography textAlign='center' variant='h4'>
          Add New Contact
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2}>
          <Input label='Name' onChange={setName} placeholder='input name for contact' value={name} />
          <Input label='Address' onChange={_onChangeAddress} placeholder='input address' value={address} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <Button disabled={!name || !address} fullWidth onClick={_onCommit} variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(AddAddressDialog);

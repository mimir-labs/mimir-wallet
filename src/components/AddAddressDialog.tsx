// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { events } from '@mimir-wallet/events';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useMemo, useState } from 'react';

import Input from './Input';
import { toastError } from './ToastRoot';

function Content({ defaultAddress, defaultName, onAdded, onClose }: { defaultAddress?: string; defaultName?: string; onAdded?: (address: string) => void; onClose?: () => void }) {
  const [name, setName] = useState<string>(defaultName || '');
  const [address, setAddress] = useState<string | undefined>(defaultAddress || '');

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

  const exists = useMemo(() => address && isAddress(address) && keyring.getAddress(address), [address]);

  const _onCommit = useCallback((): void => {
    try {
      if (!address) return;

      if (!isAddress(address)) {
        throw new Error('not a valid address');
      }

      keyring.saveAddress(address, { name: name.trim() });
      onAdded?.(address);
      events.emit('account_meta_changed', address);
      onClose?.();
    } catch (error) {
      toastError(error);
    }
  }, [address, name, onAdded, onClose]);

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Input label='Name' onChange={setName} placeholder='input name for contact' value={name} />
          <Input error={exists ? new Error('Already in related account') : null} label='Address' onChange={_onChangeAddress} placeholder='input address' value={address} />
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
    </>
  );
}

function AddAddressDialog({
  defaultAddress,
  defaultName,
  onAdded,
  onClose,
  open
}: {
  defaultAddress?: string;
  defaultName?: string;
  open: boolean;
  onAdded?: (address: string) => void;
  onClose?: () => void;
}) {
  return (
    <Dialog fullWidth maxWidth='sm' onClick={(e) => e.stopPropagation()} onClose={onClose} open={open}>
      <DialogTitle>
        <Typography textAlign='center' variant='h4'>
          Add New Contact
        </Typography>
      </DialogTitle>
      <Content defaultAddress={defaultAddress} defaultName={defaultName} onAdded={onAdded} onClose={onClose} />
    </Dialog>
  );
}

export default React.memo(AddAddressDialog);

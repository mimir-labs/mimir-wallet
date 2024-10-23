// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useMemo, useState } from 'react';

import { decodeAddress, encodeAddress } from '@mimir-wallet/api';
import { useAccount } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

import Input from './Input';
import { toastError } from './ToastRoot';

function Content({
  defaultAddress,
  watchlist,
  onAdded,
  onClose
}: {
  defaultAddress?: string;
  watchlist?: boolean;
  onAdded?: (address: string) => void;
  onClose?: () => void;
}) {
  const { addAddress, addresses } = useAccount();
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string | undefined>(defaultAddress || '');

  const _onChangeAddress = useCallback((addressInput: string) => {
    let address = '';

    try {
      const publicKey = decodeAddress(addressInput);

      address = encodeAddress(publicKey);
      setAddress(address);
    } catch {
      setAddress(addressInput);
    }
  }, []);

  const exists = useMemo(
    () =>
      address &&
      isAddress(address) &&
      addresses.findIndex((item) => item.watchlist === watchlist && addressEq(item.address, address)) > -1,
    [address, addresses, watchlist]
  );

  const _onCommit = useCallback((): void => {
    try {
      if (!address) return;

      if (!isAddress(address)) {
        throw new Error('not a valid address');
      }

      addAddress(address, name.trim(), watchlist);
      onAdded?.(address);
      onClose?.();
    } catch (error) {
      toastError(error);
    }
  }, [address, name, onAdded, onClose, addAddress, watchlist]);

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Input label='Name' onChange={setName} placeholder='input name for contact' value={name} />
          <Input
            error={exists ? new Error('Already in related account') : null}
            label='Address'
            onChange={_onChangeAddress}
            placeholder='input address'
            value={address}
          />
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
  watchlist,
  onAdded,
  onClose,
  open
}: {
  defaultAddress?: string;
  watchlist?: boolean;
  open: boolean;
  onAdded?: (address: string) => void;
  onClose?: () => void;
}) {
  return (
    <Dialog fullWidth maxWidth='sm' onClick={(e) => e.stopPropagation()} onClose={onClose} open={open}>
      <DialogTitle>
        <Typography textAlign='center' variant='h4'>
          {watchlist ? 'Add Watchlist' : 'Add New Contact'}
        </Typography>
      </DialogTitle>
      <Content defaultAddress={defaultAddress} watchlist={watchlist} onAdded={onAdded} onClose={onClose} />
    </Dialog>
  );
}

export default React.memo(AddAddressDialog);

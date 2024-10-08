// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import store from 'store';

import { utm } from '@mimir-wallet/config';
import { DETECTED_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { useSelectedAccountCallback, useToggle } from '@mimir-wallet/hooks';
import { addressToHex, service } from '@mimir-wallet/utils';

interface Props {
  name?: string;
  signatories: string[];
  threshold: number;
  checkField: () => boolean;
}

export function createMultisig(signatories: string[], threshold: number, name: string): string {
  const result = keyring.addMultisig(signatories, threshold, {
    name,
    isMimir: true
  });

  store.set(
    DETECTED_ACCOUNT_KEY,
    Array.from([...(store.get(DETECTED_ACCOUNT_KEY) || []), u8aToHex(result.pair.addressRaw)])
  );
  const { address } = result.pair;

  return address;
}

function CreateStatic({ checkField, name, signatories, threshold }: Props) {
  const [open, toggleOpen] = useToggle();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const selectAccount = useSelectedAccountCallback();

  const handleCreate = useCallback(async () => {
    if (!name || !checkField()) return;

    try {
      setIsLoading(true);

      const address = createMultisig(signatories, threshold, name);

      utm && (await service.utm(addressToHex(address), utm));

      await service.createMultisig(
        signatories.map((value) => addressToHex(value)),
        threshold,
        name
      );

      selectAccount(address);
      navigate('/');
    } catch {
      /* empty */
    }

    setIsLoading(false);
  }, [checkField, name, navigate, selectAccount, signatories, threshold]);

  return (
    <>
      <Dialog onClose={toggleOpen} open={open}>
        <DialogTitle>Create Static Multisig</DialogTitle>
        <DialogContent>
          <ul>
            <li>You're creating a non-Flexible multisig, members can't be modified.</li>
            <li>You need to submit signature to confirm your identity; this isn't a transaction.</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={toggleOpen} variant='outlined'>
            Cancel
          </Button>
          <LoadingButton fullWidth loading={isLoading} onClick={handleCreate}>
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Button
        disabled={!name}
        fullWidth
        onClick={() => {
          if (!name || !checkField()) return;

          toggleOpen();
        }}
        variant='contained'
      >
        Create
      </Button>
    </>
  );
}

export default React.memo(CreateStatic);

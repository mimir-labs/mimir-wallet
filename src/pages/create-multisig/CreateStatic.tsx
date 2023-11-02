// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useToggle } from '@mimirdev/hooks';
import { service } from '@mimirdev/utils';

interface Props {
  name?: string;
  signatories: string[];
  isThresholdValid: boolean;
  threshold: number;
}

function createMultisig(signatories: string[], threshold: number, name: string): string {
  const result = keyring.addMultisig(signatories, threshold, { name, genesisHash: '0xe0804a0b86b52b29ff4c536e5d3ea31f2ca3ab2a2b4a9caee5ced16579f42c62' });
  const { address } = result.pair;

  return address;
}

function CreateStatic({ isThresholdValid, name, signatories, threshold }: Props) {
  const [open, toggleOpen] = useToggle();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!name) return;

    try {
      setIsLoading(true);
      createMultisig(signatories, threshold, name);

      await service.createMultisig(
        signatories.map((value) => u8aToHex(decodeAddress(value))),
        threshold,
        name
      );
      navigate('/');
    } catch {}

    setIsLoading(false);
  }, [name, navigate, signatories, threshold]);

  return (
    <>
      <Dialog onClose={toggleOpen} open={open}>
        <DialogTitle>Create Static Multisig</DialogTitle>
        <DialogContent>
          <ul>
            <li>{"You're creating a non-Flexible multisig, members can't be modified."}</li>
            <li>{"You need to submit signature to confirm your identity; this isn't a transaction."}</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <LoadingButton fullWidth loading={isLoading} onClick={handleCreate}>
            Create
          </LoadingButton>
          <Button fullWidth onClick={toggleOpen} variant='outlined'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Button disabled={signatories.length < 2 || !name || !isThresholdValid} fullWidth onClick={toggleOpen} variant='contained'>
        Create
      </Button>
    </>
  );
}

export default React.memo(CreateStatic);

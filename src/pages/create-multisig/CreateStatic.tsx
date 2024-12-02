// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { u8aToHex } from '@polkadot/util';
import { createKeyMulti } from '@polkadot/util-crypto';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { decodeAddress, encodeAddress } from '@mimir-wallet/api';
import { utm } from '@mimir-wallet/config';
import { DETECTED_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { useAccount, useSelectedAccountCallback, useToggle } from '@mimir-wallet/hooks';
import { addressToHex, service, store } from '@mimir-wallet/utils';

interface Props {
  name?: string;
  signatories: string[];
  threshold: number;
  checkField: () => boolean;
}

async function createMultisig(signatories: string[], threshold: number, name: string): Promise<string> {
  const address = encodeAddress(createKeyMulti(signatories, threshold));

  await service.createMultisig(
    signatories.map((value) => addressToHex(value)),
    threshold,
    name
  );

  store.set(
    DETECTED_ACCOUNT_KEY,
    Array.from(new Set([...((store.get(DETECTED_ACCOUNT_KEY) as HexString[]) || []), u8aToHex(decodeAddress(address))]))
  );

  return address;
}

function CreateStatic({ checkField, name, signatories, threshold }: Props) {
  const [open, toggleOpen] = useToggle();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const selectAccount = useSelectedAccountCallback();
  const { addAddress, resync } = useAccount();

  const handleCreate = useCallback(async () => {
    if (!name || !checkField()) return;

    try {
      setIsLoading(true);

      const address = await createMultisig(signatories, threshold, name);

      await resync();

      utm && (await service.utm(addressToHex(address), utm));

      selectAccount(address);
      addAddress(address, name);

      navigate('/');
    } catch {
      /* empty */
    }

    setIsLoading(false);
  }, [name, checkField, signatories, threshold, resync, selectAccount, addAddress, navigate]);

  return (
    <>
      <Dialog onClose={toggleOpen} open={open}>
        <DialogTitle>Create Static Multisig</DialogTitle>
        <DialogContent>
          <ul>
            <li>You're creating a non-Flexible multisig, members and threshold can't be modified.</li>
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

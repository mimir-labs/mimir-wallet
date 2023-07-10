// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import { isAddress } from '@polkadot/util-crypto';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Input } from '@mimirdev/react-components';
import { useServer } from '@mimirdev/react-hooks';

import AccountSelect from './AccountSelect';
import { useSelectMultisig } from './useSelectMultisig';

function createMultisig(signatories: string[], threshold: number, name: string): string {
  const result = keyring.addMultisig(signatories, threshold, { name });
  const { address } = result.pair;

  return address;
}

function PageCreateMultisig() {
  const { select, signatories, unselect, unselected } = useSelectMultisig();
  const [name, setName] = useState<string>();
  const [{ address, isAddressValid }, setAddress] = useState<{ isAddressValid: boolean; address: string }>({ address: '', isAddressValid: false });
  const [{ isThresholdValid, threshold }, setThreshold] = useState<{ isThresholdValid: boolean; threshold: number }>({ isThresholdValid: true, threshold: 2 });
  const { createMultisig: createMultisigApi } = useServer();
  const navigate = useNavigate();

  const handleAdd = useCallback(() => {
    if (address && isAddressValid) {
      select(address);
    }
  }, [address, isAddressValid, select]);

  const _onChangeThreshold = useCallback(
    (value: string) => {
      setThreshold({ isThresholdValid: Number(value) >= 2 && Number(value) <= signatories.length, threshold: Number(value) });
    },
    [signatories.length]
  );

  const handleCreate = useCallback(() => {
    if (!name) return;

    const address = createMultisig(signatories, threshold, name);

    createMultisigApi(address, signatories, threshold);
    navigate('/');
  }, [createMultisigApi, name, navigate, signatories, threshold]);

  return (
    <Box sx={{ width: 520, maxWidth: '100%', margin: '0 auto' }}>
      <Button onClick={() => navigate(-1)} variant='outlined'>
        {'<'} Back
      </Button>
      <Paper sx={{ padding: 2.5, borderRadius: '20px', marginTop: 1.25 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='h3'>Create Multisig</Typography>
            <Button variant='outlined'>Import</Button>
          </Box>
          <Divider />
          <Input label='Name' onChange={setName} placeholder='input multisig account name' />
          <Input
            endButton={
              <Button onClick={handleAdd} variant='contained'>
                Add
              </Button>
            }
            label='Add Multisig Wallet Owners'
            onChange={(value) => {
              setAddress({ isAddressValid: isAddress(value), address: value });
            }}
            placeholder='input address'
          />
          <Paper elevation={0} sx={{ bgcolor: 'secondary.main', padding: 1, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <AccountSelect accounts={unselected} onClick={select} title='Addresss book' type='add' />
            <AccountSelect accounts={signatories} onClick={unselect} title='Multisig Wallet Owners' type='delete' />
          </Paper>
          <Input
            defaultValue={String(threshold)}
            error={isThresholdValid ? null : new Error(`Threshold must great than 2 and less equal than ${signatories.length}`)}
            label='Threshold'
            onChange={_onChangeThreshold}
          />
          <Button disabled={signatories.length < 2 || !name || !isThresholdValid} fullWidth onClick={handleCreate} variant='contained'>
            Create
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default PageCreateMultisig;

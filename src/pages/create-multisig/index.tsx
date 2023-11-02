// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from './types';

import { Alert, AlertTitle, Box, Button, Dialog, DialogContent, Divider, Paper, Stack, SvgIcon, Switch, Typography } from '@mui/material';
import { encodeAddress, isAddress } from '@polkadot/util-crypto';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as IconInfo } from '@mimirdev/assets/svg/icon-info-fill.svg';
import { Address, AddressRow, Input } from '@mimirdev/components';
import { usePrepareMultisig, useToggle } from '@mimirdev/hooks';

import AccountSelect from './AccountSelect';
import CreateFlexible from './CreateFlexible';
import CreateStatic from './CreateStatic';
import { useSelectMultisig } from './useSelectMultisig';

function PageCreateMultisig() {
  const navigate = useNavigate();
  const { select, signatories, unselect, unselected } = useSelectMultisig();
  const [name, setName] = useState<string>('');
  const [{ address, isAddressValid }, setAddress] = useState<{ isAddressValid: boolean; address: string }>({ address: '', isAddressValid: false });
  const [{ isThresholdValid, threshold }, setThreshold] = useState<{ isThresholdValid: boolean; threshold: number }>({ isThresholdValid: true, threshold: 2 });
  const [flexible, setFlexible] = useState(false);

  // prepare multisigs
  const [prepares] = usePrepareMultisig();
  // flexible
  const [prepare, setPrepare] = useState<PrepareFlexible>();
  const [open, toggleOpen] = useToggle();

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

  const _onFlexibleCancel = () => {
    setPrepare(undefined);
  };

  return (
    <>
      <Box sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={prepare ? _onFlexibleCancel : () => navigate(-1)} size='small' variant='outlined'>
            {'<'} Back
          </Button>
          {prepares.length > 0 && (
            <Button color='primary' onClick={toggleOpen} size='small' startIcon={<SvgIcon component={IconInfo} inheritViewBox />} variant='text'>
              {prepares.length} unfinished creation
            </Button>
          )}
        </Box>
        <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
          {prepare ? (
            <CreateFlexible onCancel={_onFlexibleCancel} prepare={prepare} />
          ) : (
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='h3'>Create Multisig</Typography>
                <Button variant='outlined'>Import</Button>
              </Box>
              <Divider />
              <Input label='Name' onChange={setName} placeholder='input multisig account name' value={name} />
              <Input
                endButton={
                  <Button onClick={handleAdd} variant='contained'>
                    Add
                  </Button>
                }
                label='Add Members'
                onChange={(value) => {
                  setAddress({ isAddressValid: isAddress(value), address: value });
                }}
                placeholder='input address'
              />
              <Paper elevation={0} sx={{ bgcolor: 'secondary.main', padding: 1, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <AccountSelect accounts={unselected} onClick={select} title='Addresss book' type='add' />
                <AccountSelect accounts={signatories} onClick={unselect} title='Members' type='delete' />
              </Paper>
              <Input
                defaultValue={String(threshold)}
                error={isThresholdValid ? null : new Error(`Threshold must great than 2 and less equal than ${signatories.length}`)}
                label='Threshold'
                onChange={_onChangeThreshold}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Flexible Multisig</Typography>
                <Switch checked={flexible} onChange={(e) => setFlexible(e.target.checked)} />
              </Box>
              <Alert severity='warning'>
                <AlertTitle>Notice</AlertTitle>
                {flexible ? (
                  <ul>
                    <li>{'You are trying to create a flexible multisig on Polkadot.'}</li>
                    <li>{'Initiating a transaction is required.'}</li>
                  </ul>
                ) : (
                  <ul>
                    <li>{'This multisig could be used on Polkadot, Kusama and all their parachains.'}</li>
                    <li>{'Once created, the multisig members and threshold cannot be modified.'}</li>
                  </ul>
                )}
              </Alert>
              {flexible ? (
                <Button
                  disabled={signatories.length < 2 || !name || !isThresholdValid}
                  fullWidth
                  onClick={() =>
                    setPrepare({
                      who: signatories,
                      threshold,
                      name
                    })
                  }
                  variant='contained'
                >
                  Create
                </Button>
              ) : (
                <CreateStatic isThresholdValid={isThresholdValid} name={name} signatories={signatories} threshold={threshold} />
              )}
            </Stack>
          )}
        </Paper>
      </Box>

      <Dialog fullWidth maxWidth='sm' onClose={toggleOpen} open={open}>
        <DialogContent sx={{ paddingY: 1 }}>
          <Stack spacing={1.5}>
            {prepares.map((item, index) => (
              <Button
                color='secondary'
                key={index}
                onClick={() => {
                  if (item.pure) {
                    setPrepare({
                      creator: item.creator,
                      who: item.who.map((address) => encodeAddress(address)),
                      threshold: item.threshold,
                      name: item.name,
                      pure: item.pure ? encodeAddress(item.pure) : null
                    });
                    toggleOpen();
                  }
                }}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'text.primary' }}
              >
                <AddressRow defaultName={item.name} value={item.pure} />
                <Typography fontWeight={400}>
                  <Address shorten value={item.pure} />
                </Typography>
              </Button>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PageCreateMultisig;

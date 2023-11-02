// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { u8aToHex } from '@polkadot/util';
import { addressEq, decodeAddress, encodeMultiAddress, isAddress } from '@polkadot/util-crypto';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Input } from '@mimirdev/components';
import { useAddressMeta, useApi, useTxQueue } from '@mimirdev/hooks';
import { service } from '@mimirdev/utils';

import AccountSelect from '../create-multisig/AccountSelect';
import { useSelectMultisig } from '../create-multisig/useSelectMultisig';

function AccountSetting() {
  const navigate = useNavigate();
  const { address: addressParam } = useParams<'address'>();
  const { meta, name, saveName, setName } = useAddressMeta(addressParam);
  const { api } = useApi();

  const { select, signatories, unselect, unselected } = useSelectMultisig(meta.who);
  const [{ address, isAddressValid }, setAddress] = useState<{ isAddressValid: boolean; address: string }>({ address: '', isAddressValid: false });
  const [{ isThresholdValid, threshold }, setThreshold] = useState<{ isThresholdValid: boolean; threshold: number }>({ isThresholdValid: true, threshold: 2 });

  const { addQueue } = useTxQueue();

  const _onClick = useCallback(() => {
    saveName();

    if (!meta.who || !meta.threshold || !addressParam) return;
    const oldMultiAddress = encodeMultiAddress(meta.who, meta.threshold);
    const newMultiAddress = encodeMultiAddress(signatories, threshold);

    if (!addressEq(newMultiAddress, oldMultiAddress)) {
      addQueue({
        beforeSend: () =>
          service.createMultisig(
            signatories.map((address) => u8aToHex(decodeAddress(address))),
            threshold,
            name,
            false
          ),
        extrinsic: api.tx.utility.batchAll([api.tx.proxy.addProxy(newMultiAddress, 0, 0), api.tx.proxy.removeProxy(oldMultiAddress, 0, 0)]),
        accountId: addressParam
      });
    }
  }, [saveName, meta, addressParam, signatories, threshold, addQueue, name, api.tx.utility, api.tx.proxy]);

  const _handleAdd = useCallback(() => {
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

  return (
    <>
      <Stack spacing={2} sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate(-1)} size='small' variant='outlined'>
            {'<'} Back
          </Button>
        </Box>
        <Typography variant='h3'>Wallet Setting</Typography>
        <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
          <Input helper='All members will see this name' label='Name' onChange={(value) => setName(value)} placeholder='Please input account name' value={name} />
        </Paper>
        <Paper component={Stack} spacing={2} sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
          <Input
            endButton={
              <Button onClick={_handleAdd} variant='contained'>
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
            <AccountSelect accounts={signatories} onClick={unselect} title='Multisig Members' type='delete' />
          </Paper>
          <Input
            defaultValue={String(threshold)}
            error={isThresholdValid ? null : new Error(`Threshold must great than 2 and less equal than ${signatories.length}`)}
            label='Threshold'
            onChange={_onChangeThreshold}
          />
        </Paper>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button fullWidth onClick={_onClick}>
            Save
          </Button>
          <Button fullWidth variant='outlined'>
            Cancel
          </Button>
        </Box>
      </Stack>
    </>
  );
}

export default AccountSetting;

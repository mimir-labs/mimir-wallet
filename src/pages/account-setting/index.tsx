// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddAddressDialog, Input, toastSuccess } from '@mimir-wallet/components';
import { useAccounts, useAddresses, useAddressMeta, useApi, useSelectedAccount, useSelectedAccountCallback, useToggle, useTransactions, useTxQueue } from '@mimir-wallet/hooks';
import { CalldataStatus } from '@mimir-wallet/hooks/types';
import { service } from '@mimir-wallet/utils';
import { Box, Button, FormHelperText, Paper, Stack, Typography } from '@mui/material';
import { u8aToHex } from '@polkadot/util';
import { addressEq, decodeAddress, encodeAddress, encodeMultiAddress, isAddress as isAddressUtil } from '@polkadot/util-crypto';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AccountSelect from '../create-multisig/AccountSelect';
import { useSelectMultisig } from '../create-multisig/useSelectMultisig';

function checkError(signatories: string[], isThresholdValid: boolean, hasSoloAccount: boolean): [Error | null, Error | null] {
  return [
    signatories.length < 2 ? new Error('Please select at least two members') : hasSoloAccount ? null : new Error('You need add at least one local account'),
    isThresholdValid ? null : new Error(`Threshold must great than 2 and less equal than ${signatories.length}`)
  ];
}

function AccountSetting() {
  const navigate = useNavigate();
  const { address: addressParam } = useParams<'address'>();
  const selected = useSelectedAccount();
  const account = addressParam || selected;
  const { meta, name, saveName, setName } = useAddressMeta(account);
  const { isAddress } = useAddresses();
  const { isAccount } = useAccounts();
  const { api } = useApi();
  const [txs] = useTransactions(account);
  const pendingTxs = useMemo(() => txs.filter((item) => item.status < CalldataStatus.Success), [txs]);
  const selectAccount = useSelectedAccountCallback();
  const { hasSoloAccount, isThresholdValid, select, setThreshold, signatories, threshold, unselect, unselected } = useSelectMultisig(meta.who, meta.threshold);
  const [{ address, isAddressValid }, setAddress] = useState<{ isAddressValid: boolean; address: string }>({ address: '', isAddressValid: false });
  const [addOpen, toggleAdd] = useToggle();
  const [addressError, setAddressError] = useState<Error | null>(null);
  const [[memberError, thresholdError], setErrors] = useState<[Error | null, Error | null]>([null, null]);

  const { addQueue } = useTxQueue();

  const checkField = useCallback((): boolean => {
    const errors = checkError(signatories, isThresholdValid, hasSoloAccount);

    setErrors(errors);

    return !errors[0] && !errors[1];
  }, [hasSoloAccount, isThresholdValid, signatories]);

  const _onClick = useCallback(async () => {
    await saveName((name) => toastSuccess(`Save name to ${name} success`));

    if (!meta.who || !meta.threshold || !account) return;
    if (!checkField()) return;
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
        accountId: account
      });
    }
  }, [checkField, saveName, meta.who, meta.threshold, account, signatories, threshold, addQueue, api.tx.utility, api.tx.proxy, name]);

  const _handleAdd = useCallback(() => {
    if (isAddressValid) {
      if (!isAddress(address) && !isAccount(address)) {
        toggleAdd();
      } else {
        select(address);
      }
    } else {
      setAddressError(new Error('Please input correct address'));
    }
  }, [address, isAccount, isAddress, isAddressValid, select, toggleAdd]);

  const _onChangeThreshold = useCallback(
    (value: string) => {
      setThreshold(Number(value));
    },
    [setThreshold]
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
        <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
          {pendingTxs.length > 0 && (
            <Box
              color='primary.main'
              onClick={() => {
                if (!account) return;

                selectAccount(account);
                navigate('/transactions');
              }}
              sx={{ cursor: 'pointer', marginBottom: 2, fontWeight: 700 }}
            >
              Please process {pendingTxs.length} Pending Transaction first
            </Box>
          )}
          {meta.isMultisig && !meta.isFlexible && (
            <Box color='warning.main' sx={{ marginBottom: 2, fontWeight: 700 }}>
              static multisig account can not change members.
            </Box>
          )}
          <Stack
            spacing={2}
            sx={{
              opacity: !meta.isMultisig || !meta.isFlexible || pendingTxs.length > 0 ? 0.5 : undefined,
              pointerEvents: !meta.isMultisig || !meta.isFlexible || pendingTxs.length > 0 ? 'none' : undefined
            }}
          >
            <Input
              endButton={
                <Button onClick={_handleAdd} variant='contained'>
                  Add
                </Button>
              }
              error={addressError}
              label='Add Member'
              onChange={(value) => {
                const isAddressValid = isAddressUtil(value);

                if (isAddressValid) {
                  setAddressError(null);
                }

                setAddress({ isAddressValid, address: isAddressValid ? encodeAddress(value) : value });
              }}
              placeholder='input address'
              value={address}
            />
            <Paper elevation={0} sx={{ bgcolor: 'secondary.main', padding: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <AccountSelect accounts={unselected} onClick={select} title='Addresss book' type='add' />
                <AccountSelect accounts={signatories} onClick={unselect} title='Multisig Members' type='delete' />
              </Box>
              {memberError && <FormHelperText sx={{ color: 'error.main' }}>{memberError.message}</FormHelperText>}
            </Paper>
            <Input defaultValue={String(threshold)} error={thresholdError} label='Threshold' onChange={_onChangeThreshold} />
          </Stack>
        </Paper>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button disabled={!name} fullWidth onClick={_onClick}>
            Save
          </Button>
          <Button fullWidth variant='outlined'>
            Cancel
          </Button>
        </Box>
      </Stack>
      {address && isAddressValid && <AddAddressDialog defaultAddress={address} onAdded={select} onClose={toggleAdd} open={addOpen} />}
    </>
  );
}

export default AccountSetting;

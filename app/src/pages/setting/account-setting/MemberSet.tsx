// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MultisigAccountData, PureAccountData } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { Input, TxButton } from '@/components';
import { service } from '@/utils';
import { Box, FormHelperText, Paper, Stack } from '@mui/material';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeMultiAddress, isAddress as isAddressUtil } from '@polkadot/util-crypto';
import { useCallback, useState } from 'react';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

import AccountSelect from '../../create-multisig/AccountSelect';
import { useSetMembers } from './useSetMembers';

function checkError(
  signatories: string[],
  isThresholdValid: boolean,
  hasSoloAccount: boolean
): [Error | null, Error | null] {
  return [
    signatories.length < 2
      ? new Error('Please select at least two members')
      : hasSoloAccount
        ? null
        : new Error('You need add at least one local account'),
    isThresholdValid ? null : new Error(`Threshold must great than 1 and less equal than ${signatories.length}`)
  ];
}

function MemberSet({
  account,
  pureAccount,
  disabled
}: {
  account: MultisigAccountData;
  pureAccount?: PureAccountData;
  disabled?: boolean;
}) {
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const { api, chainSS58 } = useApi();
  const { hasSoloAccount, isThresholdValid, select, setThreshold, signatories, threshold, unselect, unselected } =
    useSetMembers(
      account.members.map((item) => item.address),
      account.threshold
    );
  const [{ address, isAddressValid }, setAddress] = useState<{ isAddressValid: boolean; address: string }>({
    address: '',
    isAddressValid: false
  });
  const [addressError, setAddressError] = useState<Error | null>(null);
  const [[memberError, thresholdError], setErrors] = useState<[Error | null, Error | null]>([null, null]);

  const checkField = useCallback((): boolean => {
    const errors = checkError(signatories, isThresholdValid, hasSoloAccount);

    setErrors(errors);

    return !(errors[0] || errors[1]);
  }, [hasSoloAccount, isThresholdValid, signatories]);

  const _handleAdd = useCallback(() => {
    if (isAddressValid) {
      if (!(isLocalAddress(address) || isLocalAccount(address))) {
        addAddressBook(address, false, (address) => {
          select(address);
        });
      } else {
        select(address);
      }
    } else {
      setAddressError(new Error('Please input correct address'));
    }
  }, [addAddressBook, address, isAddressValid, isLocalAccount, isLocalAddress, select]);

  const _onChangeThreshold = useCallback(
    (value: string) => {
      setThreshold(Number(value));
    },
    [setThreshold]
  );

  return (
    <Stack spacing={2}>
      {!pureAccount && (
        <Box color='warning.main' sx={{ fontWeight: 700 }}>
          Static multisig account can not change members.
        </Box>
      )}
      <Stack
        spacing={2}
        sx={{
          opacity: !pureAccount || disabled ? 0.5 : undefined,
          pointerEvents: !pureAccount || disabled ? 'none' : undefined
        }}
      >
        <Input
          endButton={
            <Button onPress={_handleAdd} color='primary'>
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <AccountSelect accounts={unselected} onClick={select} title='Addresss book' type='add' />
            <AccountSelect
              accounts={signatories}
              onClick={unselect}
              title={`Multisig Members(${signatories.length})`}
              type='delete'
            />
          </Box>
          {memberError && <FormHelperText sx={{ color: 'error.main' }}>{memberError.message}</FormHelperText>}
        </Paper>
        <Input
          defaultValue={String(threshold)}
          error={thresholdError}
          label='Threshold'
          onChange={_onChangeThreshold}
        />

        <TxButton
          fullWidth
          color='primary'
          accountId={pureAccount?.address}
          getCall={() => {
            if (!checkField()) {
              throw new Error('Please fill in all fields');
            }

            if (!pureAccount) {
              throw new Error('Account not found');
            }

            const oldMultiAddress = account.address;
            const newMultiAddress = encodeMultiAddress(signatories, threshold, chainSS58);

            return api.tx.utility.batchAll([
              api.tx.proxy.addProxy(newMultiAddress, 0, 0).method.toU8a(),
              api.tx.proxy.removeProxy(oldMultiAddress, 0, 0).method.toU8a()
            ]);
          }}
          website='mimir://internal/setup'
          beforeSend={() =>
            service.createMultisig(
              signatories.map((address) => u8aToHex(decodeAddress(address))),
              threshold,
              account.name,
              false
            )
          }
        >
          Confirm
        </TxButton>
      </Stack>
    </Stack>
  );
}

export default MemberSet;

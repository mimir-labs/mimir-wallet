// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from './types';

import { useAccount } from '@/accounts/useAccount';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Address, AddressRow, Input } from '@/components';
import { useCacheMultisig } from '@/hooks/useCacheMultisig';
import { useToggle } from '@/hooks/useToggle';
import { Box, Button, Divider, FormHelperText, Paper, Stack, SvgIcon, Switch, Typography } from '@mui/material';
import { isAddress as isAddressUtil } from '@polkadot/util-crypto';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

import AccountSelect from './AccountSelect';
import CreateFlexible from './CreateFlexible';
import CreateStatic from './CreateStatic';
import { useSelectMultisig } from './useSelectMultisig';

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
    isThresholdValid ? null : new Error(`Threshold must great than 2 and less equal than ${signatories.length}`)
  ];
}

function PageCreateMultisig({ threshold1 }: { threshold1?: boolean }) {
  const navigate = useNavigate();
  const { chain } = useApi();
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [name, setName] = useState<string>('');
  const [{ address, isAddressValid }, setAddress] = useState<{ isAddressValid: boolean; address: string }>({
    address: '',
    isAddressValid: false
  });
  const [flexible, setFlexible] = useState(false);
  const { hasSoloAccount, isThresholdValid, select, setThreshold, signatories, threshold, unselect, unselected } =
    useSelectMultisig(undefined, undefined, threshold1);
  const [addressError, setAddressError] = useState<Error | null>(null);
  const [[memberError, thresholdError], setErrors] = useState<[Error | null, Error | null]>([null, null]);

  // prepare multisigs
  const [prepares] = useCacheMultisig();
  // flexible
  const [prepare, setPrepare] = useState<PrepareFlexible>();
  const [open, toggleOpen] = useToggle();

  const handleAdd = useCallback(() => {
    if (isAddressValid) {
      if (!(isLocalAddress(address) || isLocalAccount(address))) {
        addAddressBook(address, false, select);
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

  const _onFlexibleCancel = () => {
    setPrepare(undefined);
  };

  const checkField = useCallback((): boolean => {
    const errors = checkError(signatories, isThresholdValid, hasSoloAccount);

    setErrors(errors);

    return !(errors[0] || errors[1]);
  }, [hasSoloAccount, isThresholdValid, signatories]);

  return (
    <>
      <Box sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={prepare ? _onFlexibleCancel : () => navigate(-1)} size='small' variant='outlined'>
            {'<'} Back
          </Button>
          {prepares.length > 0 && (
            <Button
              color='primary'
              onClick={toggleOpen}
              size='small'
              startIcon={<SvgIcon component={IconInfo} inheritViewBox />}
              variant='text'
            >
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
                <Typography variant='h3'>{threshold1 ? 'Create 1/N Multisig' : 'Create Multisig'}</Typography>
                {/* <Button variant='outlined'>Import</Button> */}
              </Box>
              <Divider />
              <Input label='Name' onChange={setName} placeholder='input multisig account name' value={name} />
              <Input
                endButton={
                  <Button
                    disabled={threshold1 ? signatories.length === 1 : false}
                    onClick={handleAdd}
                    variant='contained'
                  >
                    Add
                  </Button>
                }
                error={addressError}
                label='Add Members'
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
                    flexDirection: { sm: 'row', xs: 'column' }
                  }}
                >
                  <AccountSelect accounts={unselected} onClick={select} title='Addresss book' type='add' />
                  <AccountSelect accounts={signatories} onClick={unselect} title='Members' type='delete' />
                </Box>
                {threshold1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      marginTop: 1,
                      color: 'text.secondary',
                      lineHeight: 1.1,
                      fontSize: '0.75rem'
                    }}
                  >
                    <SvgIcon inheritViewBox component={IconInfo} fontSize='inherit' />
                    All members can initiate transactions.
                  </Box>
                )}
                {memberError && (
                  <FormHelperText sx={{ marginTop: 1, color: 'error.main' }}>{memberError.message}</FormHelperText>
                )}
              </Paper>
              <Input
                disabled={threshold1}
                defaultValue={String(threshold)}
                error={thresholdError}
                label='Threshold'
                onChange={_onChangeThreshold}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Flexible Multisig</Typography>
                <Switch checked={flexible} onChange={(e) => setFlexible(e.target.checked)} />
              </Box>

              <Alert
                color='warning'
                classNames={{ title: 'mb-1 font-bold text-medium' }}
                icon={<SvgIcon inheritViewBox component={IconInfo} sx={{ fontSize: '0.875rem' }} />}
                title='Notice'
                description={
                  flexible ? (
                    <ul>
                      <li>
                        Only on{' '}
                        <Box
                          component='img'
                          sx={{ display: 'inline', verticalAlign: 'middle' }}
                          width={16}
                          src={chain.icon}
                        />{' '}
                        {chain.name}.
                      </li>
                      <li>Initiating a transaction is required.</li>
                    </ul>
                  ) : (
                    <ul>
                      <li>All chains supported.</li>
                      <li>Unchangeable members and thresholds.</li>
                      <li>No gas fee for creation.</li>
                    </ul>
                  )
                }
              />
              {flexible ? (
                <Button
                  disabled={!name}
                  fullWidth
                  onClick={() => {
                    if (!checkField()) {
                      return;
                    }

                    setPrepare({
                      who: signatories,
                      threshold,
                      name
                    });
                  }}
                  variant='contained'
                >
                  Create
                </Button>
              ) : (
                <CreateStatic checkField={checkField} name={name} signatories={signatories} threshold={threshold} />
              )}
            </Stack>
          )}
        </Paper>
      </Box>

      <Modal onClose={toggleOpen} isOpen={open}>
        <ModalContent>
          <ModalBody className='gap-4'>
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
                      pure: item.pure ? encodeAddress(item.pure) : null,
                      blockNumber: item.blockNumber,
                      extrinsicIndex: item.extrinsicIndex
                    });
                    toggleOpen();
                  }
                }}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'text.primary' }}
              >
                <AddressRow defaultName={item.name} value={item.pure} />
                <p>
                  <Address shorten value={item.pure} />
                </p>
              </Button>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default PageCreateMultisig;

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from './types';

import { useAccount } from '@/accounts/useAccount';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Address, AddressRow, Input, InputNetwork } from '@/components';
import { useCacheMultisig } from '@/hooks/useCacheMultisig';
import { useToggle } from '@/hooks/useToggle';
import { isAddress as isAddressUtil } from '@polkadot/util-crypto';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Divider, Modal, ModalBody, ModalContent, Switch } from '@mimir-wallet/ui';

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

function CreateMultisig({
  threshold1,
  network,
  setNetwork
}: {
  threshold1?: boolean;
  network: string;
  setNetwork: (network: string) => void;
}) {
  const navigate = useNavigate();
  const { chainSS58, chain } = useApi();
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
      <div className='w-full max-w-[500px] mx-auto'>
        <div className='flex items-center justify-between'>
          <Button onPress={prepare ? _onFlexibleCancel : () => navigate(-1)} variant='ghost'>
            {'<'} Back
          </Button>
          {prepares.length > 0 && (
            <Button color='primary' onPress={toggleOpen} startContent={<IconInfo />} variant='light'>
              {prepares.length} unfinished creation
            </Button>
          )}
        </div>
        <div className='p-4 sm:p-5 rounded-large mt-2.5 bg-content1 shadow-medium'>
          {prepare ? (
            <CreateFlexible onCancel={_onFlexibleCancel} prepare={prepare} />
          ) : (
            <div className='space-y-4'>
              <div className='flex justify-between'>
                <h3 className='text-medium'>{threshold1 ? 'Create 1/N Multisig' : 'Create Multisig'}</h3>
                {/* <Button variant='outlined'>Import</Button> */}
              </div>
              <Divider />
              <Input label='Name' onChange={setName} placeholder='input multisig account name' value={name} />
              <Input
                endButton={
                  <Button
                    isDisabled={threshold1 ? signatories.length === 1 : false}
                    onPress={handleAdd}
                    variant='solid'
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

                  setAddress({
                    isAddressValid,
                    address: isAddressValid ? encodeAddress(value, chainSS58) : value
                  });
                }}
                placeholder='input address'
                value={address}
              />
              <div className='bg-secondary rounded-medium p-2.5'>
                <div className='flex flex-col justify-between gap-2.5'>
                  <AccountSelect accounts={unselected} onClick={select} title='Addresss book' type='add' />
                  <AccountSelect accounts={signatories} onClick={unselect} title='Members' type='delete' />
                </div>
                {threshold1 && (
                  <div className='flex items-center gap-1 mt-2.5 text-foreground/50 text-tiny leading-[14px] h-[14px] max-h-[14px] font-normal'>
                    <IconInfo />
                    All members can initiate transactions.
                  </div>
                )}
                {memberError && <div className='mt-2.5 text-danger'>{memberError.message}</div>}
              </div>
              <Input
                disabled={threshold1}
                defaultValue={String(threshold)}
                error={thresholdError}
                label='Threshold'
                onChange={_onChangeThreshold}
              />

              <div>
                <div className='flex items-center justify-between'>
                  <div className='font-bold'>Flexible Multisig</div>
                  <Switch isSelected={flexible} onValueChange={(checked) => setFlexible(checked)} />
                </div>
                <p className='text-foreground/50 text-tiny font-normal mt-1'>
                  Flexible Multisig allows you to change members and thresholds
                </p>
              </div>

              {flexible && <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />}

              <Alert
                color='warning'
                classNames={{ title: 'mb-1 font-bold text-medium' }}
                icon={<IconInfo />}
                title='Notice'
                description={
                  flexible ? (
                    <ul>
                      <li>
                        Only on{' '}
                        <img
                          style={{ display: 'inline', verticalAlign: 'middle' }}
                          width={16}
                          height={16}
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
                  isDisabled={!name}
                  fullWidth
                  onPress={() => {
                    if (!checkField()) {
                      return;
                    }

                    setPrepare({
                      who: signatories,
                      threshold,
                      name
                    });
                  }}
                  variant='ghost'
                >
                  Create
                </Button>
              ) : (
                <CreateStatic checkField={checkField} name={name} signatories={signatories} threshold={threshold} />
              )}
            </div>
          )}
        </div>
      </div>

      <Modal onClose={toggleOpen} isOpen={open}>
        <ModalContent>
          <ModalBody className='gap-4'>
            {prepares.map((item, index) => (
              <Button
                color='secondary'
                key={index}
                onPress={() => {
                  if (item.pure) {
                    setPrepare({
                      creator: item.creator,
                      who: item.who.map((address) => encodeAddress(address, chainSS58)),
                      threshold: item.threshold,
                      name: item.name,
                      pure: item.pure ? encodeAddress(item.pure, chainSS58) : null,
                      blockNumber: item.blockNumber,
                      extrinsicIndex: item.extrinsicIndex
                    });
                    toggleOpen();
                  }
                }}
                className='flex items-center justify-between text-primary'
              >
                <AddressRow defaultName={item.name} withAddress withName value={item.pure} />
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

export default CreateMultisig;

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from './types';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Address, AddressRow, Input, InputNetwork } from '@/components';
import { useCacheMultisig } from '@/hooks/useCacheMultisig';
import { encodeMultiAddress } from '@polkadot/util-crypto';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { allEndpoints, encodeAddress, remoteProxyRelations, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Button, Divider, Link, Modal, ModalBody, ModalContent, Switch } from '@mimir-wallet/ui';

import AccountSelect from './AccountSelect';
import CreateFlexible from './CreateFlexible';
import CreateStatic from './CreateStatic';
import StaticDisplay from './StaticDisplay';
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
    isThresholdValid
      ? null
      : new Error(`Threshold must great or equal than 1 and less or equal than ${signatories.length}`)
  ];
}

function CreateMultisig({ network, setNetwork }: { network: string; setNetwork: (network: string) => void }) {
  const navigate = useNavigate();
  const { chainSS58, chain, genesisHash } = useApi();
  const [name, setName] = useState<string>('');
  const { hideAccount } = useAccount();

  const [flexible, setFlexible] = useState(false);
  const {
    hasSoloAccount,
    isThresholdValid,
    select,
    setThreshold,
    signatories,
    threshold,
    unselect,
    unselected,
    unselectAll
  } = useSelectMultisig();
  const [[memberError, thresholdError], setErrors] = useState<[Error | null, Error | null]>([null, null]);
  const multisigAddress = useMemo(
    () => (signatories.length > 1 && threshold > 0 ? encodeMultiAddress(signatories, threshold) : undefined),
    [signatories, threshold]
  );
  const { meta } = useAddressMeta(multisigAddress);

  // prepare multisigs
  const [prepares] = useCacheMultisig();
  // flexible
  const [prepare, setPrepare] = useState<PrepareFlexible>();
  const [open, toggleOpen] = useToggle(false);
  const [staticDisplayOpen, toggleStaticDisplayOpen] = useToggle(false);

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

  const remoteProxyChain = useMemo(
    () =>
      remoteProxyRelations[genesisHash]
        ? allEndpoints.find((item) => item.genesisHash === remoteProxyRelations[genesisHash])
        : null,
    [genesisHash]
  );

  return (
    <>
      <div className='mx-auto w-full max-w-[500px]'>
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
        <div className='rounded-large bg-content1 border-secondary shadow-medium mt-2.5 border-1 p-4 sm:p-5'>
          {prepare ? (
            <CreateFlexible onCancel={_onFlexibleCancel} prepare={prepare} />
          ) : (
            <div className='space-y-4'>
              <div className='flex justify-between'>
                <h3 className='text-medium'>Create Multisig</h3>
                {/* <Button variant='outlined'>Import</Button> */}
              </div>
              <Divider />
              <Input label='Name' onChange={setName} placeholder='input multisig account name' value={name} />

              <div className='bg-secondary rounded-medium space-y-2.5 p-2.5'>
                <AccountSelect
                  withSearch
                  scroll
                  accounts={unselected}
                  ignoreAccounts={signatories}
                  onClick={select}
                  title='Addresss book'
                  type='add'
                />

                {memberError && <div className='text-danger'>{memberError.message}</div>}
              </div>

              <div className='bg-secondary rounded-medium space-y-2.5 p-2.5'>
                <AccountSelect scroll={false} accounts={signatories} onClick={unselect} title='Members' type='delete' />

                {threshold === 1 ? (
                  <div className='text-foreground/50 text-tiny flex h-[14px] max-h-[14px] items-center gap-1 leading-[14px] font-normal'>
                    <IconInfo />
                    All members can initiate transactions.
                  </div>
                ) : null}
              </div>

              <Input
                defaultValue={String(threshold)}
                error={thresholdError}
                label='Threshold'
                onChange={_onChangeThreshold}
              />

              <div>
                <div className='flex items-center justify-between'>
                  <div className='font-bold'>Add Pure Proxy</div>
                  <Switch isSelected={flexible} onValueChange={(checked) => setFlexible(checked)} />
                </div>
                <p className='text-foreground/50 text-tiny mt-1 font-normal'>
                  Flexible Multisig allows you to change members and thresholds
                </p>
              </div>

              {flexible && <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />}

              <Alert
                color='warning'
                classNames={{ title: 'font-bold text-medium', description: 'text-foreground/50 text-tiny' }}
                icon={<IconInfo />}
                title='Notice'
                description={
                  flexible ? (
                    <ul style={{ listStyle: 'outside' }}>
                      <li>
                        This account only exists on{' '}
                        <img
                          style={{ display: 'inline', verticalAlign: 'middle' }}
                          width={16}
                          height={16}
                          src={chain.icon}
                        />{' '}
                        {chain.name}.
                      </li>
                      {remoteProxyChain ? (
                        <li>
                          You can use this proxy on{' '}
                          <img
                            style={{ display: 'inline', verticalAlign: 'middle' }}
                            width={16}
                            height={16}
                            src={remoteProxyChain.icon}
                          />{' '}
                          {remoteProxyChain.name} due to{' '}
                          <Link isExternal underline='always' href='https://blog.kchr.de/ecosystem-proxy/'>
                            Remote Proxy
                          </Link>
                        </li>
                      ) : null}

                      <li>Initiating a transaction is required.</li>
                    </ul>
                  ) : (
                    <ul style={{ listStyle: 'outside' }}>
                      <li>All chains supported.</li>
                      <li>Unchangeable members and thresholds.</li>
                      <li>No gas fee for creation.</li>
                    </ul>
                  )
                }
              />

              <div className='flex items-center gap-2'>
                <Button
                  fullWidth
                  onPress={() => {
                    setName('');
                    setThreshold(2);
                    unselectAll();
                  }}
                  variant='ghost'
                >
                  Clear
                </Button>

                {flexible ? (
                  <Button
                    isDisabled={!name}
                    fullWidth
                    onPress={() => {
                      if (!checkField()) {
                        return;
                      }

                      if (!meta.name) {
                        toggleStaticDisplayOpen(true);
                      } else {
                        setPrepare({
                          who: signatories,
                          threshold,
                          name,
                          multisigName: meta.name
                        });
                      }
                    }}
                    variant='solid'
                  >
                    Create
                  </Button>
                ) : (
                  <CreateStatic checkField={checkField} name={name} signatories={signatories} threshold={threshold} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <StaticDisplay
        isOpen={staticDisplayOpen}
        onClose={toggleStaticDisplayOpen}
        onConfirm={(multisigName, hide) => {
          toggleStaticDisplayOpen(false);
          setPrepare({
            who: signatories,
            threshold,
            name,
            multisigName
          });

          if (hide) {
            hideAccount(encodeMultiAddress(signatories, threshold));
          }
        }}
      />

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
                      multisigName: item.multisigName,
                      pure: item.pure ? encodeAddress(item.pure, chainSS58) : null,
                      blockNumber: item.blockNumber,
                      extrinsicIndex: item.extrinsicIndex
                    });
                    toggleOpen();
                  }
                }}
                className='text-primary flex items-center justify-between'
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

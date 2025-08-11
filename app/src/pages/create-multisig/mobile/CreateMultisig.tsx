// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from '../types';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Input, InputNetwork } from '@/components';
import { encodeMultiAddress } from '@polkadot/util-crypto';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Divider, Switch } from '@mimir-wallet/ui';

import Prepare from '../components/Prepare';
import Tips from '../components/Tips';
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
    isThresholdValid
      ? null
      : new Error(`Threshold must great or equal than 1 and less or equal than ${signatories.length}`)
  ];
}

function CreateMultisig({ network, setNetwork }: { network: string; setNetwork: (network: string) => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');

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

  // flexible
  const [prepare, setPrepare] = useState<PrepareFlexible>();

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

  if (prepare) {
    return <CreateFlexible onCancel={_onFlexibleCancel} prepare={prepare} />;
  }

  return (
    <>
      <div className='mx-auto w-full max-w-[500px]'>
        <div className='flex items-center justify-between'>
          <Button onClick={prepare ? _onFlexibleCancel : () => navigate(-1)} variant='ghost'>
            {'<'} Back
          </Button>
          <Prepare onSelect={setPrepare} />
        </div>
        <div className='bg-content1 border-secondary shadow-medium mt-2.5 rounded-[20px] border-1 p-4 sm:p-5'>
          <div className='space-y-4'>
            <div className='flex justify-between'>
              <h3 className='text-base'>Create Multisig</h3>
              {/* <Button variant='outlined'>Import</Button> */}
            </div>
            <Divider />
            <Input label='Name' onChange={setName} placeholder='input multisig account name' value={name} />

            <div className='bg-secondary space-y-2.5 rounded-[10px] p-2.5'>
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

            <div className='bg-secondary space-y-2.5 rounded-[10px] p-2.5'>
              <AccountSelect scroll={false} accounts={signatories} onClick={unselect} title='Members' type='delete' />

              {threshold === 1 ? (
                <div className='text-foreground/50 flex h-[14px] max-h-[14px] items-center gap-1 text-xs leading-[14px] font-normal'>
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
              <p className='text-foreground/50 mt-1 text-xs font-normal'>
                Flexible Multisig allows you to change members and thresholds
              </p>
            </div>

            {flexible && <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />}

            <Tips flexible={flexible} />

            <div className='flex items-center gap-2'>
              <Button
                fullWidth
                onClick={() => {
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
                  disabled={!name}
                  fullWidth
                  onClick={() => {
                    if (!checkField()) {
                      return;
                    }

                    setPrepare({
                      who: signatories,
                      threshold,
                      name,
                      multisigName: meta.name
                    });
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
        </div>
      </div>
    </>
  );
}

export default CreateMultisig;

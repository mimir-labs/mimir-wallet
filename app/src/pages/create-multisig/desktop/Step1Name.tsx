// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StepProps } from './types';

import { Input, InputNetwork } from '@/components';
import { MigrationTip } from '@/features/assethub-migration';

import { Button, Divider } from '@mimir-wallet/ui';

import AddPureProxy from '../components/AddPureProxy';
import Tips from '../components/Tips';

interface Step1NameProps extends StepProps {
  name: string;
  onNameChange: (name: string) => void;
  isPureProxy: boolean;
  onPureProxyChange: (value: boolean) => void;
  onNext: () => void;
}

function Step1Name({
  isPureProxy,
  name,
  network,
  setNetwork,
  onNameChange,
  onNext,
  onPureProxyChange
}: Step1NameProps) {
  return (
    <div className='flex flex-col gap-4'>
      {/* Name Input Section */}
      <Input
        label='Name'
        placeholder='Enter multisig name'
        value={name}
        onChange={onNameChange}
        helper={
          <p className='text-foreground/50 text-xs'>
            This name will be visible to all Signers and can be changed anytime.
          </p>
        }
      />

      {/* Pure Proxy Toggle */}
      <AddPureProxy isPureProxy={isPureProxy} onPureProxyChange={onPureProxyChange} />

      {isPureProxy ? <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} /> : null}

      {isPureProxy && <MigrationTip type='create-multisig' chain={network} />}
      {/* Notice Alert */}
      <Tips flexible={isPureProxy} />

      {/* Divider */}
      <Divider />

      {/* Action Buttons */}
      <div className='flex gap-2.5'>
        <Button fullWidth size='md' color='primary' radius='full' onClick={onNext} disabled={!name.trim()}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default Step1Name;

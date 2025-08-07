// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from '../types';

import { useAccount } from '@/accounts/useAccount';
import { StepIndicator } from '@/components';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useWizardState } from '@/hooks/useWizardState';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Divider } from '@mimir-wallet/ui';

import CreateStaticModal from '../components/CreateStaticModal';
import CreateSuccess from '../components/CreateSuccess';
import Prepare from '../components/Prepare';
import CreateFlexible from '../mobile/CreateFlexible';
import Step1Name from './Step1Name';
import Step2Members from './Step2Members';
import Step3Review from './Step3Review';

interface MultisigData {
  name: string;
  isPureProxy: boolean;
  members: string[];
  threshold: number;
}

const STEPS = [
  { number: 1, label: 'Name' },
  { number: 2, label: 'Signers and Threshold' },
  { number: 3, label: 'Review' }
];

function DesktopCreateMultisig() {
  const { addAddress } = useAccount();
  const [network, setNetwork] = useInputNetwork();
  const navigate = useNavigate();
  const [staticOpen, toggleStaticOpen] = useToggle(false);
  const [isSuccess, toggleSuccess] = useToggle(false);
  const [completedAddress, setCompletedAddress] = useState<string | null>(null);
  const [prepare, setPrepare] = useState<PrepareFlexible>();

  // Use useWizardState for managing wizard state
  const [wizardState, wizardActions] = useWizardState<MultisigData>(
    {
      name: '',
      isPureProxy: false,
      members: [],
      threshold: 1
    },
    STEPS,
    1
  );

  const { currentStep, data: multisigData } = wizardState;
  const { goToNext, goToPrevious, updateData } = wizardActions;

  const handleConfirm = async () => {
    if (multisigData.isPureProxy) {
      setPrepare({
        who: multisigData.members,
        threshold: multisigData.threshold,
        name: multisigData.name,
        multisigName: multisigData.name
      });
    } else {
      toggleStaticOpen(true);
    }
  };

  return (
    <SubApiRoot network={network}>
      {prepare ? (
        <CreateFlexible prepare={prepare} onCancel={() => setPrepare(undefined)} />
      ) : (
        <div className='mx-auto flex w-full max-w-[800px] flex-col gap-5'>
          <div className='flex items-center justify-between'>
            <Button onClick={() => navigate(-1)} variant='ghost'>
              {'<'} Back
            </Button>
            <Prepare onSelect={setPrepare} />
          </div>

          <Card className='shadow-small mx-auto w-full max-w-[800px]'>
            <CardHeader className='gap-4'>
              <CardTitle className='text-foreground text-center text-xl font-extrabold'>Create Multisig</CardTitle>
              <Divider />
              <CardDescription>
                <StepIndicator steps={STEPS} currentStep={currentStep} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <Step1Name
                  network={network}
                  name={multisigData.name}
                  onNameChange={(name) => updateData({ name })}
                  isPureProxy={multisigData.isPureProxy}
                  onPureProxyChange={(isPureProxy) => updateData({ isPureProxy })}
                  onNext={goToNext}
                  setNetwork={setNetwork}
                />
              )}
              {currentStep === 2 && (
                <Step2Members
                  members={multisigData.members}
                  onMembersChange={(members) => updateData({ members })}
                  threshold={multisigData.threshold}
                  onThresholdChange={(threshold) => updateData({ threshold })}
                  onNext={goToNext}
                  onBack={goToPrevious}
                />
              )}
              {currentStep === 3 && (
                <Step3Review
                  name={multisigData.name}
                  members={multisigData.members}
                  threshold={multisigData.threshold}
                  isPureProxy={multisigData.isPureProxy}
                  network={network}
                  onBack={goToPrevious}
                  onConfirm={handleConfirm}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <CreateStaticModal
        isOpen={staticOpen}
        onClose={() => toggleStaticOpen(false)}
        name={multisigData.name}
        signatories={multisigData.members}
        threshold={multisigData.threshold}
        onSuccess={(address: string) => {
          addAddress(address, multisigData.name);
          setCompletedAddress(address);
          toggleStaticOpen(false);
          toggleSuccess(true);
        }}
      />

      {completedAddress && (
        <CreateSuccess isOpen={isSuccess} onClose={() => toggleSuccess(false)} address={completedAddress} />
      )}
    </SubApiRoot>
  );
}

export default DesktopCreateMultisig;

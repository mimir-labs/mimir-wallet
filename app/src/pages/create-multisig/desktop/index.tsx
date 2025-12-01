// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from '../types';

import {
  type FunctionCallHandler,
  toFunctionCallNumber,
  toFunctionCallString,
  toFunctionCallStringArray
} from '@mimir-wallet/ai-assistant';
import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Divider } from '@mimir-wallet/ui';
import { useCallback, useState } from 'react';
import { useToggle } from 'react-use';

import CreateStaticModal from '../components/CreateStaticModal';
import CreateSuccess from '../components/CreateSuccess';
import Prepare from '../components/Prepare';
import CreateFlexible from '../mobile/CreateFlexible';

import Step1Name from './Step1Name';
import Step2Members from './Step2Members';
import Step3Review from './Step3Review';

import { useAccount } from '@/accounts/useAccount';
import { StepIndicator } from '@/components';
import { useRouteDependentHandler } from '@/hooks/useFunctionCallHandler';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useWizardState } from '@/hooks/useWizardState';

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

  const [network, setNetwork] = useInputNetwork();

  const { currentStep, data: multisigData } = wizardState;
  const { goToNext, goToPrevious, goToStep, updateData } = wizardActions;

  const handleCreateMultisig = useCallback<FunctionCallHandler>(
    (event) => {
      // No need to check event.name - only 'createMultisig' events arrive here
      const newData: Partial<MultisigData> = {};

      // Safe access to config object
      const network = event.arguments.network as string | undefined;

      if (network) {
        setNetwork(network);

        newData.isPureProxy = true;
      } else {
        newData.isPureProxy = false;
      }

      // Safe type conversion for name
      const nameValue = toFunctionCallString(event.arguments.name);

      if (nameValue !== undefined && nameValue !== null) {
        newData.name = nameValue;
      }

      // Safe type conversion for threshold
      const thresholdValue = toFunctionCallNumber(event.arguments.threshold);

      if (thresholdValue !== undefined) {
        newData.threshold = thresholdValue;
      }

      // Safe type conversion for members array
      const membersValue = toFunctionCallStringArray(event.arguments.members);

      if (membersValue !== undefined) {
        newData.members = membersValue;
      }

      // Navigate to review step first
      goToStep(3);

      // Then update data - using setTimeout to ensure step change completes first
      setTimeout(() => {
        updateData(newData);
      }, 0);
    },
    [goToStep, setNetwork, updateData]
  );

  useRouteDependentHandler('createMultisig', '/create-multisig', handleCreateMultisig, {
    displayName: 'Create Multisig'
  });

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
    <NetworkProvider network={network}>
      {prepare ? (
        <CreateFlexible prepare={prepare} onCancel={() => setPrepare(undefined)} />
      ) : (
        <div className='mx-auto flex w-full max-w-[800px] flex-col gap-5'>
          <div className='flex items-center justify-between'>
            <Button onClick={() => window.history.back()} variant='ghost'>
              {'<'} Back
            </Button>
            <Prepare onSelect={setPrepare} />
          </div>

          <Card className='shadow-small mx-auto w-full max-w-[800px]'>
            <CardHeader className='gap-4'>
              <CardTitle className='text-foreground text-center text-xl font-extrabold'>Create Multisig</CardTitle>
              <Divider />
              <CardDescription>
                <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />
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
                  isPureProxy={multisigData.isPureProxy}
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
                  onNameChange={(name) => updateData({ name })}
                  setNetwork={setNetwork}
                  onPureProxyChange={(isPureProxy) => updateData({ isPureProxy })}
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
    </NetworkProvider>
  );
}

export default DesktopCreateMultisig;

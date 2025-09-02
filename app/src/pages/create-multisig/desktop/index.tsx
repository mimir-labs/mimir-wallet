// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from '../types';

import { useAccount } from '@/accounts/useAccount';
import { StepIndicator } from '@/components';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useWizardState } from '@/hooks/useWizardState';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { type FunctionCallHandler, useAIContext, useFunctionCall } from '@mimir-wallet/ai-assistant';
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
  const { updateContext } = useAIContext();

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
  const { goToNext, goToPrevious, goToStep, updateData } = wizardActions;

  // Update AI context when wizard state changes
  useEffect(() => {
    const pageContext = {
      page: 'create-multisig',
      wizard: {
        currentStep,
        totalSteps: STEPS.length,
        steps: STEPS.map((s) => s.label)
      },
      form: {
        name: multisigData.name,
        isPureProxy: multisigData.isPureProxy,
        members: multisigData.members,
        threshold: multisigData.threshold
      },
      availableFunctions: ['updateFormField', 'updateFormBatch', 'navigateWizardStep']
    };

    const cleanup = updateContext(JSON.stringify(pageContext, null, 2));

    return cleanup;
  }, [currentStep, multisigData, updateContext]);

  // Define function call handlers matching server tool names
  const functionHandlers: Record<string, FunctionCallHandler> = {
    // Standard server tool: updateFormField
    updateFormField: async (event) => {
      const { fieldName, value } = event.arguments;

      if (fieldName === 'name' && typeof value === 'string') {
        updateData({ name: value });

        return { id: event.id, success: true, result: { [fieldName]: value } };
      }

      if (fieldName === 'isPureProxy' && typeof value === 'boolean') {
        updateData({ isPureProxy: value });

        return { id: event.id, success: true, result: { [fieldName]: value } };
      }

      if (fieldName === 'threshold' && typeof value === 'number') {
        updateData({ threshold: value });

        return { id: event.id, success: true, result: { [fieldName]: value } };
      }

      if (fieldName === 'members' && Array.isArray(value)) {
        updateData({ members: value });

        return { id: event.id, success: true, result: { [fieldName]: value } };
      }

      return { id: event.id, success: false, error: `Unsupported field: ${fieldName}` };
    },

    // Standard server tool: updateFormBatch
    updateFormBatch: async (event) => {
      const { updates } = event.arguments;

      try {
        const validUpdates: Partial<MultisigData> = {};

        for (const [key, value] of Object.entries(updates)) {
          if (key === 'name' && typeof value === 'string') {
            validUpdates.name = value;
          } else if (key === 'isPureProxy' && typeof value === 'boolean') {
            validUpdates.isPureProxy = value;
          } else if (key === 'members' && Array.isArray(value)) {
            validUpdates.members = value;
          } else if (key === 'threshold' && typeof value === 'number') {
            validUpdates.threshold = value;
          }
        }

        updateData(validUpdates);

        return {
          id: event.id,
          success: true,
          result: validUpdates
        };
      } catch (error) {
        return {
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Batch update failed'
        };
      }
    },

    // Standard server tool: navigateWizardStep
    navigateWizardStep: async (event) => {
      const { step } = event.arguments;

      try {
        if (typeof step === 'number') {
          if (step >= 1 && step <= STEPS.length) {
            goToStep(step);

            return { id: event.id, success: true, result: { currentStep: step } };
          }

          return { id: event.id, success: false, error: 'Invalid step number' };
        }

        if (typeof step === 'string') {
          switch (step) {
            case 'next':
              if (currentStep < STEPS.length) {
                goToNext();

                return { id: event.id, success: true, result: { currentStep: currentStep + 1 } };
              }

              return { id: event.id, success: false, error: 'Already at last step' };

            case 'previous':
              if (currentStep > 1) {
                goToPrevious();

                return { id: event.id, success: true, result: { currentStep: currentStep - 1 } };
              }

              return { id: event.id, success: false, error: 'Already at first step' };

            case 'first':
              goToStep(1);

              return { id: event.id, success: true, result: { currentStep: 1 } };

            case 'last':
              goToStep(STEPS.length);

              return { id: event.id, success: true, result: { currentStep: STEPS.length } };

            default:
              return { id: event.id, success: false, error: `Unknown step direction: ${step}` };
          }
        }

        return { id: event.id, success: false, error: 'Invalid step parameter' };
      } catch (error) {
        return {
          id: event.id,
          success: false,
          error: error instanceof Error ? error.message : 'Wizard navigation failed'
        };
      }
    }
  };

  // Register function call handlers
  useFunctionCall(functionHandlers);

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

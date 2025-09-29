// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionResult } from '../types';

import { useAccount } from '@/accounts/useAccount';
import { StepIndicator } from '@/components';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useWizardState } from '@/hooks/useWizardState';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { type FunctionCallHandler, functionCallManager } from '@mimir-wallet/ai-assistant';
import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Divider, Spinner } from '@mimir-wallet/ui';

import Step1ConfigureAccess from './Step1ConfigureAccess';
import Step2PermissionLevel from './Step2PermissionLevel';
import Step3Review from './Step3Review';
import SuccessModal from './SuccessModal';

interface ProxyWizardData {
  // Step 1: Configure Access
  proxied: string;
  proxy: string;
  isPureProxy: boolean;
  pureProxyName?: string;

  // Step 2: Permission Level
  proxyType: string;
  hasDelay: boolean;
  delayType: 'hour' | 'day' | 'week' | 'custom';
  customBlocks: string;
}

const STEPS = [
  { number: 1, label: 'Configure Access' },
  { number: 2, label: 'Permission Level' },
  { number: 3, label: 'Review' }
];

function PageAddProxy({ pure }: { pure?: boolean }) {
  const { current } = useAccount();
  const navigate = useNavigate();

  // Network and API setup
  const [network, setNetwork] = useInputNetwork();

  // Wizard state using the new hook
  const initialData: ProxyWizardData = {
    proxied: current || '',
    proxy: '',
    isPureProxy: !!pure,
    pureProxyName: '',
    proxyType: 'Any',
    hasDelay: false,
    delayType: 'hour',
    customBlocks: ''
  };

  const [wizardState, wizardActions] = useWizardState(initialData, STEPS);
  const { goToStep, updateData } = wizardActions;

  // Success modal state
  const [isSuccess, toggleSuccess] = useToggle(false);
  const [transactionData, setTransactionData] = useState<TransactionResult | null>(null);

  const handleConfirm = async (result: TransactionResult) => {
    // Store transaction result for success modal
    setTransactionData(result);

    // Show success modal for both completed and pending transactions
    toggleSuccess(true);
  };

  useEffect(() => {
    const handler: FunctionCallHandler = (event) => {
      if (event.name !== 'createProxy') return;

      const newData: Partial<ProxyWizardData> = {};

      if (event.arguments.proxied !== undefined) {
        newData.proxied = event.arguments.proxied;
      }

      if (event.arguments.proxy !== undefined) {
        newData.proxy = event.arguments.proxy;
      }

      if (event.arguments.isPureProxy !== undefined) {
        newData.isPureProxy = event.arguments.isPureProxy;
      }

      if (event.arguments.pureProxyName !== undefined) {
        newData.pureProxyName = event.arguments.pureProxyName;
      }

      if (event.arguments.proxyType !== undefined) {
        newData.proxyType = event.arguments.proxyType;
      }

      if (event.arguments.hasDelay !== undefined) {
        newData.hasDelay = event.arguments.hasDelay;
      }

      if (event.arguments.delayType !== undefined) {
        newData.delayType = event.arguments.delayType;
      }

      if (event.arguments.customBlocks !== undefined) {
        newData.customBlocks = event.arguments.customBlocks.toString();
      }

      if (event.arguments.step !== undefined) {
        goToStep(event.arguments.step);
      }

      updateData(newData);

      return functionCallManager.respondToFunctionCall({
        id: event.id,
        success: true,
        result: newData
      });
    };

    return functionCallManager.onFunctionCall(handler);
  }, [goToStep, setNetwork, updateData]);

  return (
    <SubApiRoot
      network={network}
      Fallback={() => (
        <div className='bg-content1 mx-auto my-0 flex w-[800px] max-w-full items-center justify-center rounded-[20px] py-10'>
          <Spinner size='lg' variant='wave' label='Connecting to the network...' />
        </div>
      )}
    >
      <div className='mx-auto flex w-full max-w-[800px] flex-col gap-5'>
        <div className='flex items-center justify-between'>
          <Button onClick={() => navigate(-1)} variant='ghost'>
            {'<'} Back
          </Button>
        </div>

        <Card className='shadow-small mx-auto w-full max-w-[800px]'>
          <CardHeader className='gap-4'>
            <CardTitle className='text-foreground text-center text-xl font-extrabold'>
              Proxy Authorization Setup
            </CardTitle>
            <Divider />
            <CardDescription>
              <StepIndicator steps={STEPS} currentStep={wizardState.currentStep} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wizardState.currentStep === 1 && (
              <Step1ConfigureAccess
                network={network}
                setNetwork={setNetwork}
                proxied={wizardState.data.proxied}
                proxy={wizardState.data.proxy}
                isPureProxy={wizardState.data.isPureProxy}
                pureProxyName={wizardState.data.pureProxyName}
                onNext={wizardActions.goToNext}
                onDataChange={wizardActions.updateData}
              />
            )}
            {wizardState.currentStep === 2 && (
              <Step2PermissionLevel
                proxyType={wizardState.data.proxyType}
                hasDelay={wizardState.data.hasDelay}
                delayType={wizardState.data.delayType}
                customBlocks={wizardState.data.customBlocks}
                proxy={wizardState.data.proxy}
                proxied={wizardState.data.proxied}
                isPureProxy={wizardState.data.isPureProxy}
                pureProxyName={wizardState.data.pureProxyName}
                onNext={wizardActions.goToNext}
                onBack={wizardActions.goToPrevious}
                onDataChange={wizardActions.updateData}
              />
            )}
            {wizardState.currentStep === 3 && (
              <Step3Review
                wizardData={wizardState.data}
                network={network}
                onBack={wizardActions.goToPrevious}
                onConfirm={handleConfirm}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <SuccessModal
        isOpen={isSuccess}
        onClose={() => toggleSuccess(false)}
        transactionResult={transactionData}
        network={network}
      />
    </SubApiRoot>
  );
}

export default PageAddProxy;

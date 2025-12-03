// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionResult } from '../types';

import {
  type FunctionCallHandler,
  isFunctionCallObject,
  toFunctionCallBoolean,
  toFunctionCallString
} from '@mimir-wallet/ai-assistant';
import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Divider } from '@mimir-wallet/ui';
import { useCallback, useState } from 'react';
import { useToggle } from 'react-use';

import Step1ConfigureAccess from './Step1ConfigureAccess';
import Step2PermissionLevel from './Step2PermissionLevel';
import Step3Review from './Step3Review';
import SuccessModal from './SuccessModal';

import { useAccount } from '@/accounts/useAccount';
import { StepIndicator } from '@/components';
import { useRouteDependentHandler } from '@/hooks/useFunctionCallHandler';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useWizardState } from '@/hooks/useWizardState';

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

  const handleCreateProxy = useCallback<FunctionCallHandler>(
    (event) => {
      // No need to check event.name - only 'createProxy' events arrive here
      const newData: Partial<ProxyWizardData> = {};

      // Safe type conversion for proxyType (top-level)
      const proxyTypeValue = toFunctionCallString(event.arguments.proxyType);
      const proxyValue = toFunctionCallString(event.arguments.proxy);
      const networkValue = toFunctionCallString(event.arguments.network);

      if (proxyTypeValue) {
        newData.proxyType = proxyTypeValue;
      }

      // Safe access to config object
      const config = event.arguments.config as unknown as
        | (
            | {
                isPureProxy: false;
                proxied?: string;
              }
            | {
                isPureProxy: true;
                pureProxyName: string;
              }
          )
        | undefined;

      if (config) {
        if (config.isPureProxy === false) {
          // Standard proxy configuration
          newData.isPureProxy = false;

          if (config.proxied) {
            newData.proxied = config.proxied;
          }

          // Clear pureProxyName when switching to standard proxy mode
          newData.pureProxyName = '';
        } else if (config.isPureProxy === true) {
          // Pure proxy configuration
          newData.isPureProxy = true;

          if (config.pureProxyName) {
            newData.pureProxyName = config.pureProxyName;
          }

          // IMPORTANT: Clear proxy field in pure proxy mode
          // Pure proxy doesn't need a specific proxy address
          newData.proxy = '';
        }
      }

      // IMPORTANT: Always update proxy field if provided explicitly
      // This will override the default behavior above
      if (proxyValue !== undefined && proxyValue !== null) {
        newData.proxy = proxyValue;
      }

      // Handle delay discriminated union: { enabled: boolean, period?: { type, blocks? } }
      const delayValue = event.arguments.delay;

      if (isFunctionCallObject(delayValue)) {
        const enabled = toFunctionCallBoolean(delayValue.enabled);

        if (enabled === false) {
          // No delay
          newData.hasDelay = false;
        } else if (enabled === true) {
          // Has delay
          newData.hasDelay = true;

          // Handle nested period discriminated union
          const periodValue = delayValue.period;

          if (isFunctionCallObject(periodValue)) {
            const periodType = toFunctionCallString(periodValue.type);

            if (periodType === 'hour' || periodType === 'day' || periodType === 'week' || periodType === 'custom') {
              newData.delayType = periodType;

              // If custom type, extract blocks
              if (periodType === 'custom') {
                const blocksValue = toFunctionCallString(periodValue.blocks);

                if (blocksValue) {
                  newData.customBlocks = blocksValue;
                }
              }
            }
          }
        }
      }

      // Navigate to review step first
      goToStep(3);

      // Then update data - using setTimeout to ensure step change completes first
      setTimeout(() => {
        updateData(newData);
      });

      if (networkValue) {
        setNetwork(networkValue);
      }
    },
    [goToStep, setNetwork, updateData]
  );

  useRouteDependentHandler('createProxy', '/add-proxy', handleCreateProxy, {
    displayName: 'Add Proxy'
  });

  return (
    <NetworkProvider network={network}>
      <AddProxyContent
        network={network}
        setNetwork={setNetwork}
        wizardState={wizardState}
        wizardActions={wizardActions}
        handleConfirm={handleConfirm}
        isSuccess={isSuccess}
        toggleSuccess={toggleSuccess}
        transactionData={transactionData}
      />
    </NetworkProvider>
  );
}

interface AddProxyContentProps {
  network: string;
  setNetwork: (network: string) => void;
  wizardState: ReturnType<typeof useWizardState<ProxyWizardData>>[0];
  wizardActions: ReturnType<typeof useWizardState<ProxyWizardData>>[1];
  handleConfirm: (result: TransactionResult) => Promise<void>;
  isSuccess: boolean;
  toggleSuccess: (value?: boolean) => void;
  transactionData: TransactionResult | null;
}

function AddProxyContent({
  network,
  setNetwork,
  wizardState,
  wizardActions,
  handleConfirm,
  isSuccess,
  toggleSuccess,
  transactionData
}: AddProxyContentProps) {
  const { goToStep } = wizardActions;

  return (
    <>
      <div className='mx-auto flex w-full max-w-[800px] flex-col gap-5'>
        <div className='flex items-center justify-between'>
          <Button onClick={() => window.history.back()} variant='ghost'>
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
              <StepIndicator steps={STEPS} currentStep={wizardState.currentStep} onStepClick={goToStep} />
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
                network={network}
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
    </>
  );
}

export default PageAddProxy;

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from '../types';

import { useAccount } from '@/accounts/useAccount';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';
import { Button, Card, CardBody, CardHeader, Divider } from '@mimir-wallet/ui';

import CreateStaticModal from '../components/CreateStaticModal';
import CreateSuccess from '../components/CreateSuccess';
import Prepare from '../components/Prepare';
import CreateFlexible from '../mobile/CreateFlexible';
import Step1Name from './Step1Name';
import Step2Members from './Step2Members';
import Step3Review from './Step3Review';
import StepIndicator from './StepIndicator';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [multisigData, setMultisigData] = useState<MultisigData>({
    name: '',
    isPureProxy: false,
    members: [],
    threshold: 1
  });
  const navigate = useNavigate();
  const [staticOpen, toggleStaticOpen] = useToggle(false);
  const [isSuccess, toggleSuccess] = useToggle(false);
  const [completedAddress, setCompletedAddress] = useState<string | null>(null);
  const [prepare, setPrepare] = useState<PrepareFlexible>();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  const updateData = (updates: Partial<MultisigData>) => {
    setMultisigData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SubApiRoot network={network}>
      {prepare ? (
        <CreateFlexible prepare={prepare} onCancel={() => setPrepare(undefined)} />
      ) : (
        <div className='mx-auto flex w-full max-w-[800px] flex-col gap-5'>
          <div className='flex items-center justify-between'>
            <Button onPress={() => navigate(-1)} variant='ghost'>
              {'<'} Back
            </Button>
            <Prepare onSelect={setPrepare} />
          </div>

          <Card className='shadow-small mx-auto w-full max-w-[800px]'>
            <CardHeader className='flex flex-col gap-4 p-5'>
              <h1 className='text-foreground text-xl font-extrabold'>Create Multisig</h1>
              <Divider className='bg-secondary' />
              <StepIndicator steps={STEPS} currentStep={currentStep} />
            </CardHeader>
            <CardBody className='p-5 pt-0'>
              {currentStep === 1 && (
                <Step1Name
                  network={network}
                  name={multisigData.name}
                  onNameChange={(name) => updateData({ name })}
                  isPureProxy={multisigData.isPureProxy}
                  onPureProxyChange={(isPureProxy) => updateData({ isPureProxy })}
                  onNext={handleNext}
                  setNetwork={setNetwork}
                />
              )}
              {currentStep === 2 && (
                <Step2Members
                  members={multisigData.members}
                  onMembersChange={(members) => updateData({ members })}
                  threshold={multisigData.threshold}
                  onThresholdChange={(threshold) => updateData({ threshold })}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <Step3Review
                  name={multisigData.name}
                  members={multisigData.members}
                  threshold={multisigData.threshold}
                  isPureProxy={multisigData.isPureProxy}
                  network={network}
                  onBack={handleBack}
                  onConfirm={handleConfirm}
                />
              )}
            </CardBody>
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

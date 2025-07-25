// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface StepData {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: StepData[];
  currentStep: number;
}

function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className='flex w-full items-center gap-4'>
      {steps.map((step) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <div key={step.number} className={`bg-secondary flex h-10 flex-1 items-center rounded-full`}>
            <div className='flex h-10 items-center gap-2.5 pr-2.5'>
              <div
                className={`flex h-10 w-10 flex-[0_0_auto] items-center justify-center rounded-full text-base font-bold ${
                  isActive || isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'text-primary-foreground bg-primary/5'
                }`}
              >
                {step.number}
              </div>
              <span className={`text-sm font-bold ${isActive || isCompleted ? 'text-foreground' : 'text-foreground'}`}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator;

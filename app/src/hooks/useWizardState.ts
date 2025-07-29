// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';

interface WizardStep {
  number: number;
  label: string;
  isValid?: boolean;
}

interface WizardState<T> {
  currentStep: number;
  data: T;
  steps: WizardStep[];
}

interface WizardActions<T> {
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;
  updateData: (updates: Partial<T>) => void;
  resetWizard: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Generic hook for managing wizard state and navigation
 * Provides common wizard functionality like step navigation and data management
 */
export function useWizardState<T>(
  initialData: T,
  steps: WizardStep[],
  initialStep: number = 1
): [WizardState<T>, WizardActions<T>] {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [data, setData] = useState<T>(initialData);

  const goToNext = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const goToPrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= steps.length) {
        setCurrentStep(step);
      }
    },
    [steps.length]
  );

  const updateData = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(initialStep);
    setData(initialData);
  }, [initialStep, initialData]);

  const canGoNext = currentStep < steps.length;
  const canGoPrevious = currentStep > 1;

  const state: WizardState<T> = {
    currentStep,
    data,
    steps
  };

  const actions: WizardActions<T> = {
    goToNext,
    goToPrevious,
    goToStep,
    updateData,
    resetWizard,
    canGoNext,
    canGoPrevious
  };

  return [state, actions];
}

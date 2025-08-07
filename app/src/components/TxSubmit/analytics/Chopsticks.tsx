// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import IconFailed from '@/assets/svg/icon-failed-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success.svg?react';
import React, { useState } from 'react';

import { simulate, useApi } from '@mimir-wallet/polkadot-core';
import { Button, buttonSpinner } from '@mimir-wallet/ui';

import Cell from './Cell';

const EMPTY_SIMULATION = {
  isDone: false,
  success: false,
  error: null,
  isLoading: false
};

function SafetyCheck({ call, account }: { call: IMethod; account?: string }) {
  const [simulation, setSimulation] = useState<{
    isDone: boolean;
    success: boolean;
    error: string | null;
    isLoading: boolean;
  }>(EMPTY_SIMULATION);
  const { api, chain } = useApi();
  const [html, setHtml] = useState<string>('');

  const handleSimulate = () => {
    if (account && call) {
      setSimulation({ ...EMPTY_SIMULATION, isLoading: true });
      simulate(api, Object.values(chain.wsUrl), call, account)
        .then(({ success, html, error }) => {
          setSimulation({ isDone: true, success, error, isLoading: false });
          setHtml(html);
        })
        .catch((error) => {
          setSimulation({ isDone: true, success: false, error: error.message || 'Unknown Error', isLoading: false });
        });
    }
  };

  return (
    <div>
      <div className='font-bold'>Transaction Simulation</div>
      <Cell title='Simulation' img={<img src='/images/chopsticks.webp' alt='chopticks' className='h-[24px]' />}>
        {simulation.isDone ? (
          <div className='flex items-center gap-1'>
            {simulation.success ? (
              <IconSuccess className='text-success h-4 w-4' />
            ) : (
              <IconFailed className='text-danger h-4 w-4' />
            )}

            <div className='relative'>
              <p
                data-success={simulation.success}
                data-error={simulation.error}
                className='data-[success=true]:text-success data-[error]:text-danger font-bold'
              >
                {simulation.success ? 'Success' : simulation.error || 'Unknown Error'}
              </p>

              <Button
                className='absolute top-full right-0 min-w-0 p-0'
                variant='light'
                onClick={() => {
                  const newWindow = window.open();

                  newWindow?.document.open();
                  newWindow?.document.write(html);
                  newWindow?.document.close();
                }}
                size='sm'
              >
                Details
              </Button>
            </div>
          </div>
        ) : (
          <Button variant='ghost' disabled={simulation.isLoading} onClick={handleSimulate}>
            {simulation.isLoading ? buttonSpinner : undefined}
            {simulation.isLoading ? '~30s' : 'Simulate'}
          </Button>
        )}
      </Cell>
    </div>
  );
}

export default React.memo(SafetyCheck);

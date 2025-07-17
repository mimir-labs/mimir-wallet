// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SafetyLevel } from '@/hooks/types';
import type { IMethod } from '@polkadot/types/types';

import Logo from '@/assets/images/logo.png';
import IconFailed from '@/assets/svg/icon-failed-fill.svg?react';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success.svg?react';
import React, { useState } from 'react';

import { simulate, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Spinner } from '@mimir-wallet/ui';

function Cell({ title, children, img }: { img: React.ReactNode; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className='bg-secondary rounded-medium mt-2 flex items-center justify-between gap-2.5 p-2.5'>
      <div className='flex-1'>
        <div className='font-bold'>{title}</div>
        <div className='flex items-center gap-2.5'>
          <span className='text-foreground/50 text-small'>Powered by</span>
          {img}
        </div>
      </div>
      {children}
    </div>
  );
}

const EMPTY_SIMULATION = {
  isDone: false,
  success: false,
  error: null,
  isLoading: false
};

function SafetyCheck({
  isTxBundleLoading,
  call,
  account,
  txError,
  safetyCheck
}: {
  isTxBundleLoading: boolean;
  txError?: Error | null;
  safetyCheck?: SafetyLevel;
  call: IMethod;
  account?: string;
}) {
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
      <div className='font-bold'>Transaction Check</div>
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
                onPress={() => {
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
          <Button variant='ghost' isLoading={simulation.isLoading} onPress={handleSimulate}>
            {simulation.isLoading ? '~30s' : 'Simulate'}
          </Button>
        )}
      </Cell>

      {safetyCheck && safetyCheck.severity === 'none' ? null : (
        <Cell title='Cross-chain Check' img={<img src={Logo} alt='mimir' className='h-[14px]' />}>
          {!safetyCheck && <Spinner size='sm' />}
          {safetyCheck && (
            <>
              {safetyCheck.severity === 'none' && <IconSuccess className='text-success h-4 w-4' />}
              {safetyCheck.severity === 'error' && <IconFailed className='text-danger h-4 w-4' />}
              {safetyCheck.severity === 'warning' && <IconInfo className='text-warning h-4 w-4' />}

              <p
                data-success={safetyCheck.severity === 'none'}
                data-error={safetyCheck.severity === 'error'}
                data-warning={safetyCheck.severity === 'warning'}
                className='data-[success=true]:text-success data-[error]:text-danger data-[warning]:text-warning font-bold'
              >
                {safetyCheck?.message}
              </p>
            </>
          )}
        </Cell>
      )}
      <Cell title='Authority Check' img={<img src={Logo} alt='mimir' className='h-[14px]' />}>
        {isTxBundleLoading && <Spinner size='sm' />}
        {!isTxBundleLoading && (
          <>
            {!txError ? (
              <IconSuccess className='text-success h-4 w-4' />
            ) : (
              <IconFailed className='text-danger h-4 w-4' />
            )}

            <p
              data-success={!txError}
              data-error={!!txError}
              className='data-[success=true]:text-success data-[error=true]:text-danger font-bold'
            >
              {!txError ? 'Permission Granted' : 'Perimission Denied'}
            </p>
          </>
        )}
      </Cell>
    </div>
  );
}

export default React.memo(SafetyCheck);

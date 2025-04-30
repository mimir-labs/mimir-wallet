// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SafetyLevel } from '@/hooks/types';

import Logo from '@/assets/images/logo.png';
import IconFailed from '@/assets/svg/icon-failed-fill.svg?react';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import IconSuccess from '@/assets/svg/icon-success.svg?react';
import React from 'react';

import { Spinner } from '@mimir-wallet/ui';

import Cell from './Cell';

function SafetyCheck({
  isTxBundleLoading,
  txError,
  safetyCheck
}: {
  isTxBundleLoading: boolean;
  txError?: Error | null;
  safetyCheck?: SafetyLevel;
}) {
  return (
    <div>
      <div className='font-bold'>Safety Check</div>

      {safetyCheck && safetyCheck.severity === 'none' ? null : (
        <Cell title='Cross-chain Check' img={<img src={Logo} alt='mimir' className='h-[14px]' />}>
          {!safetyCheck && <Spinner size='sm' />}
          {safetyCheck && (
            <>
              {safetyCheck.severity === 'none' && <IconSuccess className='text-success w-4 h-4' />}
              {safetyCheck.severity === 'error' && <IconFailed className='text-danger w-4 h-4' />}
              {safetyCheck.severity === 'warning' && <IconInfo className='text-warning w-4 h-4' />}

              <p
                data-success={safetyCheck.severity === 'none'}
                data-error={safetyCheck.severity === 'error'}
                data-warning={safetyCheck.severity === 'warning'}
                className='font-bold data-[success=true]:text-success data-[error]:text-danger data-[warning]:text-warning'
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
              <IconSuccess className='text-success w-4 h-4' />
            ) : (
              <IconFailed className='text-danger w-4 h-4' />
            )}

            <p
              data-success={!txError}
              data-error={!!txError}
              className='font-bold data-[success=true]:text-success data-[error=true]:text-danger'
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

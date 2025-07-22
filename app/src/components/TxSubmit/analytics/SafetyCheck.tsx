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

function SafetyCheck({ safetyCheck }: { safetyCheck?: SafetyLevel }) {
  if (safetyCheck && safetyCheck.severity === 'none') {
    return null;
  }

  return (
    <div>
      <div className='font-bold'>Safety Check</div>

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
    </div>
  );
}

export default React.memo(SafetyCheck);

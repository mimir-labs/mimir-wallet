// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconCancel from '@/assets/svg/icon-cancel.svg?react';
import IconIdentity from '@/assets/svg/icon-identity.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import React from 'react';

function CallDisplaySection({ section, method }: { section?: string; method?: string }) {
  if (
    [
      'balances.transfer',
      'balances.transferKeepAlive',
      'balances.transferAllowDeath',
      'balances.forceTransfer',
      'balances.transferAll'
    ].includes(`${section}.${method}`)
  ) {
    return (
      <div className='flex items-center gap-1'>
        <IconSend className='text-primary h-4 w-4' />
        Transfer
      </div>
    );
  }

  if (
    [
      'assets.transfer',
      'assets.transferKeepAlive',
      'assets.forceTransfer',
      'tokens.transfer',
      'tokens.transferKeepAlive',
      'tokens.transferAll',
      'tokens.forceTransfer'
    ].includes(`${section}.${method}`)
  ) {
    return (
      <div className='flex items-center gap-1'>
        <IconSend className='text-primary h-4 w-4' />
        Assets Transfer
      </div>
    );
  }

  if (['identity.setIdentity'].includes(`${section}.${method}`)) {
    return (
      <div className='flex items-center gap-1'>
        <IconIdentity className='text-primary h-4 w-4' />
        Identity
      </div>
    );
  }

  if (['multisig.cancelAsMulti'].includes(`${section}.${method}`)) {
    return (
      <div className='flex items-center gap-1'>
        <IconCancel className='text-danger h-4 w-4' />
        Cancel
      </div>
    );
  }

  return `${section}.${method}`;
}

export default React.memo<typeof CallDisplaySection>(CallDisplaySection);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';
import { useEffect } from 'react';

import { functionCallManager } from '@mimir-wallet/ai-assistant';
import { useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar } from '@mimir-wallet/ui';

interface SetSs58ChainProps {
  eventId: string;
  networkKey?: string;
}

function SetSs58Chain({ eventId, networkKey }: SetSs58ChainProps) {
  const { networks } = useNetworks();
  const chain = networks.find((network) => network.key === networkKey);

  useEffect(() => {
    // Auto-respond that the chain switch was successful
    functionCallManager.respondToFunctionCall({
      id: eventId,
      success: true,
      result: { message: `Switched to ${chain?.name || networkKey} Format` }
    });
  }, [eventId, chain?.name, networkKey]);

  if (!chain) return null;

  return (
    <div className='border-divider-300 flex items-center justify-between rounded-[10px] border p-2.5'>
      <div className='flex items-center gap-2.5'>
        <Avatar src={chain.icon} className='h-[30px] w-[30px] bg-transparent' />
        <div className='text-foreground leading-normal font-bold'>
          Switched to <span className='text-primary'>{chain.name} Format</span>
        </div>
      </div>
      <IconSuccess className='text-success h-4 w-4' />
    </div>
  );
}

export default SetSs58Chain;

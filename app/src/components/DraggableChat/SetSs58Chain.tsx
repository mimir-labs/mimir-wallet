// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains } from '@mimir-wallet/polkadot-core';
import { Avatar } from '@mimir-wallet/ui';

import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';

interface SetSs58ChainProps {
  eventId: string;
  networkKey?: string;
}

function SetSs58Chain({ networkKey }: SetSs58ChainProps) {
  const { chains } = useChains();
  const chain = chains.find((network) => network.key === networkKey);

  if (!chain) return null;

  return (
    <div className="border-divider flex items-center justify-between rounded-[10px] border p-2.5">
      <div className="flex items-center gap-2.5">
        <Avatar src={chain.icon} className="h-[30px] w-[30px] bg-transparent" />
        <div className="text-foreground leading-normal font-bold">
          Switched to <span className="text-primary">{chain.name} Format</span>
        </div>
      </div>
      <IconSuccess className="text-success h-4 w-4" />
    </div>
  );
}

export default SetSs58Chain;

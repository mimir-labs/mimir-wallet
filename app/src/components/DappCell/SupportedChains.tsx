// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import { useMemo } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, AvatarGroup, Tooltip } from '@mimir-wallet/ui';

function SupportedChains({ app }: { app: DappOption }) {
  const { networks } = useNetworks();

  const supportedNetworks = useMemo(() => {
    const supportedChains = app.supportedChains;

    if (supportedChains === true) {
      return networks;
    }

    return networks.filter((network) => supportedChains.includes(network.key));
  }, [app.supportedChains, networks]);

  return (
    <Tooltip
      classNames={{ content: 'max-w-[300px]' }}
      color='foreground'
      content={supportedNetworks.map((network) => network.name).join(', ')}
      closeDelay={0}
    >
      <AvatarGroup max={3} renderCount={(count) => <p className='text-tiny text-foreground/50 !ms-1'>+{count}</p>}>
        {supportedNetworks.map((network, index) => (
          <Avatar
            classNames={{ base: 'data-[hover=true]:transform-none' }}
            style={{ width: 20, height: 20, backgroundColor: 'transparent', marginInlineStart: index ? -4 : 0 }}
            key={network.key}
            src={network.icon}
          />
        ))}
      </AvatarGroup>
    </Tooltip>
  );
}

export default SupportedChains;

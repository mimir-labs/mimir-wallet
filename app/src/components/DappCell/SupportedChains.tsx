// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';
import type { Endpoint } from '@mimir-wallet/polkadot-core';

import { useChains } from '@mimir-wallet/polkadot-core';
import { Avatar, AvatarGroup, Tooltip } from '@mimir-wallet/ui';
import { useMemo } from 'react';

function SupportedChains({ app }: { app: DappOption }) {
  const { chains: networks } = useChains();

  const supportedNetworks = useMemo((): Endpoint[] => {
    const supportedChains = app.supportedChains;

    if (supportedChains === true) {
      return networks;
    }

    return networks.filter((network: Endpoint) => supportedChains.includes(network.key));
  }, [app.supportedChains, networks]);

  return (
    <Tooltip
      classNames={{ content: 'max-w-[300px]' }}
      color='foreground'
      content={supportedNetworks.map((network: Endpoint) => network.name).join(', ')}
    >
      <AvatarGroup max={3} renderCount={(count) => <p className='text-foreground/50 !ms-1 text-xs'>+{count}</p>}>
        {supportedNetworks.map((network: Endpoint, index: number) => (
          <Avatar
            classNames={{ base: 'data-[hover=true]:translate-none' }}
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

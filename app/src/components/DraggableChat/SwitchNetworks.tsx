// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains } from '@mimir-wallet/polkadot-core';
import { useMemo } from 'react';

interface SwitchNetworksProps {
  eventId: string;
  networks: Array<{ networkKey: string; isEnabled: boolean }>;
}

// SwitchNetworks component based on Figma design
function SwitchNetworks({ networks }: SwitchNetworksProps) {
  const { chains: allNetworks } = useChains();

  const networkList = useMemo(() => {
    const result = [];

    for (const networkItem of networks) {
      const networkDetails = allNetworks.find((network) => network.key === networkItem.networkKey);

      if (networkDetails) {
        result.push({
          ...networkDetails,
          isEnabled: networkItem.isEnabled
        });
      }
    }

    return result;
  }, [networks, allNetworks]);

  return networkList.map(({ key, ...network }) => <NetworkItem key={key} {...network} />);
}

// Individual network item component
function NetworkItem(network: { key: string; name: string; icon: string; isEnabled: boolean }) {
  const { name, icon, isEnabled } = network;

  return (
    <div className='border-divider flex w-full items-center justify-between rounded-[10px] border p-[10px]'>
      {/* Left side: Icon and name */}
      <div className='flex items-center gap-2.5'>
        <img src={icon} alt={name} className='h-[30px] w-[30px] rounded-full' />
        <div className='text-[14px] font-bold'>{name}</div>
      </div>

      {/* Right side: Status */}
      <div className={`text-[14px] font-bold ${isEnabled ? 'text-success' : 'text-danger'}`}>
        {isEnabled ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
}

export default SwitchNetworks;

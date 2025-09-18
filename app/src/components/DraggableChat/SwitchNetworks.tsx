// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { useNetworks } from '@mimir-wallet/polkadot-core';

interface SwitchNetworksProps {
  eventId: string;
  networks: Array<{ networkKey: string; isEnabled: boolean }>;
}

// SwitchNetworks component based on Figma design
function SwitchNetworks({ networks }: SwitchNetworksProps) {
  const { networks: allNetworks } = useNetworks();

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

  return networkList.map((network) => <NetworkItem {...network} />);
}

// Individual network item component
function NetworkItem(network: { key: string; name: string; icon: string; isEnabled: boolean }) {
  const { name, icon, isEnabled } = network;

  return (
    <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border p-[10px]'>
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

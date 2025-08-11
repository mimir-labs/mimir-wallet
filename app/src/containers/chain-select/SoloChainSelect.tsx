// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useMemo } from 'react';

import { allEndpoints, type Network, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Button, Popover, PopoverContent, PopoverTrigger, Spinner } from '@mimir-wallet/ui';

function SoloChainSelect() {
  const { current } = useAccount();
  const { isApiReady, network } = useApi();
  const { networks } = useNetworks();
  const [account] = useQueryAccount(current);

  const endpoint = useMemo(() => allEndpoints.find((item) => item.key === network), [network]);
  const groupedEndpoints = useMemo(() => {
    const groupedEndpoints = networks.reduce(
      (acc, network) => {
        if (network.isRelayChain) {
          acc[network.key] = [network, ...(acc[network.key] || [])];
        } else if (network.relayChain) {
          acc[network.relayChain] = [...(acc[network.relayChain] || []), network];
        } else {
          acc['solochain'] = [...(acc['solochain'] || []), network];
        }

        return acc;
      },
      {} as Record<string, Network[]>
    );

    return groupedEndpoints;
  }, [networks]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            color='primary'
            variant='bordered'
            radius='md'
            className='border-secondary bg-secondary h-[32px] font-bold sm:h-[42px] sm:bg-transparent'
          >
            <div className='hidden sm:block'>
              {isApiReady ? (
                <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
              ) : (
                <Spinner size='sm' />
              )}
            </div>
            <div className='hidden sm:block'>{!isApiReady ? 'Connecting...' : endpoint?.name}</div>
            <div className='block sm:hidden'>
              {!isApiReady ? (
                'Connecting...'
              ) : (
                <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent side='bottom' align='end' className='rounded-[20px] p-2.5'>
          <div className='scrollbar-hide max-h-[80dvh] overflow-y-auto'>
            <div className='space-y-2.5'>
              {Object.keys(groupedEndpoints).map((group) => (
                <div key={`group-${group}`}>
                  <h6 className='text-primary mb-[5px] pl-2.5 capitalize sm:mb-2.5'>{group}</h6>
                  <div className='grid grid-cols-2 gap-[5px] sm:grid-cols-3 sm:gap-2.5'>
                    {groupedEndpoints[group].map((endpoint) => (
                      <Button
                        key={endpoint.key}
                        fullWidth
                        variant='light'
                        radius='sm'
                        color='secondary'
                        data-selected={network === endpoint.key}
                        className='text-foreground data-[selected=true]:bg-secondary data-[hover=true]:bg-secondary justify-start px-2.5 text-left font-normal shadow-none'
                        onClick={() => {
                          if ((account && account.type === 'pure') || !current) {
                            window.location.href = `${window.location.origin}?network=${endpoint.key}`;
                          } else {
                            window.location.href = `${window.location.origin}?network=${endpoint.key}&address=${current}`;
                          }
                        }}
                      >
                        <img src={endpoint.icon} className='mr-2.5 w-5 rounded-[5px]' />
                        {endpoint.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default SoloChainSelect;

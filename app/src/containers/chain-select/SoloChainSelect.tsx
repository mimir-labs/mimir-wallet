// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import { useMemo, useState } from 'react';

import { allEndpoints, type Network, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spinner } from '@mimir-wallet/ui';

function SoloChainSelect() {
  const { current } = useAccount();
  const { isApiReady, network } = useApi();
  const { networks } = useNetworks();
  const [account] = useQueryAccount(current);
  const [isOpen, setIsOpen] = useState(false);

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
      <Popover placement='bottom-end' isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            startContent={
              <div className='hidden sm:block'>
                {isApiReady ? (
                  <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
                ) : (
                  <Spinner size='sm' />
                )}
              </div>
            }
            color='primary'
            variant='bordered'
            radius='md'
            className='border-secondary font-bold h-[32px] sm:h-[42px] bg-secondary sm:bg-transparent'
          >
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
        <PopoverContent className='p-2.5'>
          <ScrollShadow hideScrollBar isEnabled={false} className='max-h-[80dvh]'>
            <div className='space-y-2.5'>
              {Object.keys(groupedEndpoints).map((group) => (
                <div key={`group-${group}`}>
                  <h6 color='primary.main' className='text-primary capitalize pl-2.5 mb-[5px] sm:mb-2.5'>
                    {group}
                  </h6>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-[5px] sm:gap-2.5'>
                    {groupedEndpoints[group].map((endpoint) => (
                      <Button
                        key={endpoint.key}
                        fullWidth
                        variant='light'
                        radius='sm'
                        color='secondary'
                        data-selected={network === endpoint.key}
                        className='justify-start text-foreground font-normal shadow-none text-left px-2.5 data-[selected=true]:bg-secondary data-[hover=true]:bg-secondary'
                        onPress={() => {
                          if ((account && account.type === 'pure') || !current) {
                            window.location.href = `${window.location.origin}?network=${endpoint.key}`;
                          } else {
                            window.location.href = `${window.location.origin}?network=${endpoint.key}&address=${current}`;
                          }
                        }}
                      >
                        <img src={endpoint.icon} className='w-5 rounded-small mr-2.5' />
                        {endpoint.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollShadow>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default SoloChainSelect;

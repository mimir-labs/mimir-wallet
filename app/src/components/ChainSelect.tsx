// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { allEndpoints, groupedEndpoints } from '@/config';
import { useApi } from '@/hooks/useApi';
import { useMemo } from 'react';

import { Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spinner } from '@mimir-wallet/ui';

function ChainSelect({ onlyLogo }: { onlyLogo: boolean }) {
  const { isApiReady, network } = useApi();

  const endpoint = useMemo(() => allEndpoints.find((item) => item.key === network), [network]);
  const groupEndpoints = useMemo(() => groupedEndpoints(), []);

  return (
    <>
      <Popover placement='bottom-end'>
        <PopoverTrigger>
          {onlyLogo ? (
            <Button color='primary' className='border-secondary' variant='bordered'>
              {isApiReady ? (
                <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
              ) : (
                <Spinner size='sm' />
              )}
            </Button>
          ) : (
            <Button
              startContent={
                isApiReady ? (
                  <img alt='' src={endpoint?.icon} style={{ borderRadius: 10 }} width={20} />
                ) : (
                  <Spinner size='sm' />
                )
              }
              color='primary'
              variant='bordered'
              className='border-secondary font-bold'
            >
              {!isApiReady ? 'Connecting...' : endpoint?.name}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className='p-2.5'>
          <ScrollShadow hideScrollBar isEnabled={false} className='max-h-[80dvh]'>
            <div className='space-y-2.5'>
              {Object.keys(groupEndpoints).map((group) => (
                <div key={`group-${group}`}>
                  <h6 color='primary.main' className='text-primary capitalize pl-2.5 mb-[5px] sm:mb-2.5'>
                    {group}
                  </h6>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-[5px] sm:gap-2.5'>
                    {groupEndpoints[group].map((endpoint) => (
                      <Button
                        key={endpoint.key}
                        fullWidth
                        variant='light'
                        radius='sm'
                        color='secondary'
                        data-selected={network === endpoint.key}
                        className='justify-start text-foreground font-normal shadow-none text-left px-2.5 data-[selected=true]:bg-secondary data-[hover=true]:bg-secondary'
                        onPress={() => {
                          window.location.href = `${window.location.origin}?network=${endpoint.key}`;
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

export default ChainSelect;

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { groupedEndpoints, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spinner } from '@mimir-wallet/ui';

function ChainSelect({ onlyLogo }: { onlyLogo: boolean }) {
  const { network, setNetwork, allApis } = useApi();

  const currentApi = useMemo(
    () => Object.values(allApis).find((item) => item.chain.key === network),
    [allApis, network]
  );
  const groupEndpoints = useMemo(() => groupedEndpoints(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const changeNetwork = (network: string) => {
    setNetwork(network);
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.set('network', network);
    setSearchParams(newSearchParams);
  };

  return (
    <Popover placement='bottom-end' isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <div>
          {onlyLogo ? (
            <Button color='primary' className='border-secondary' variant='bordered' onPress={() => setIsOpen(true)}>
              {currentApi?.isApiReady ? (
                <img alt='' src={currentApi?.chain.icon} style={{ borderRadius: 10 }} width={20} />
              ) : (
                <Spinner size='sm' />
              )}
            </Button>
          ) : (
            <Button
              startContent={
                currentApi?.isApiReady ? (
                  <img alt='' src={currentApi?.chain.icon} style={{ borderRadius: 10 }} width={20} />
                ) : (
                  <Spinner size='sm' />
                )
              }
              color='primary'
              variant='bordered'
              className='border-secondary font-bold'
              onPress={() => setIsOpen(true)}
            >
              {!currentApi?.isApiReady ? 'Connecting...' : currentApi.chain?.name}
            </Button>
          )}
        </div>
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
                        changeNetwork(endpoint.key);
                        setIsOpen(false);
                      }}
                    >
                      <img src={endpoint.icon} className='w-5 rounded-small mr-2.5' />
                      {endpoint.name}
                      {allApis[endpoint.key]?.isApiReady ? null : <Spinner size='sm' />}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollShadow>
      </PopoverContent>
    </Popover>
  );
}

export default ChainSelect;

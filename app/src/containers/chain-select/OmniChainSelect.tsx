// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import IconWebsite from '@/assets/svg/icon-website.svg?react';
import { useMigrationNetworks } from '@/features/assethub-migration/useMigrationStatus';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { type Network, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Switch,
  Tooltip
} from '@mimir-wallet/ui';

function Status({ network }: { network: Network }) {
  const { allApis } = useApi();

  const apiState = allApis[network.key];

  if (!apiState) {
    return <Avatar src={network.icon} style={{ width: 32, height: 32, backgroundColor: 'transparent' }} />;
  }

  return (
    <Tooltip
      content={
        apiState.isApiReady ? 'Connected' : apiState.apiError ? apiState.apiError || 'Connect Failed' : 'Connecting...'
      }
    >
      <Badge
        color={apiState.isApiReady ? 'success' : apiState.apiError ? 'danger' : 'warning'}
        content=''
        shape='circle'
        size='sm'
      >
        <Avatar src={network.icon} style={{ width: 32, height: 32, backgroundColor: 'transparent' }} />
      </Badge>
    </Tooltip>
  );
}

function GroupedEndpoints({
  group,
  endpoints,
  completedMigrationNetworks,
  enableNetworks,
  disableNetworks
}: {
  group: string;
  endpoints: Network[];
  completedMigrationNetworks: string[];
  enableNetworks: (networks: string[]) => void;
  disableNetworks: (networks: string[]) => void;
}) {
  const isAllEnabled = endpoints.every((endpoint) => endpoint.enabled);
  const peopleNetworks = useMemo(
    () =>
      Array.from(
        new Set(endpoints.map((network) => network.identityNetwork).filter((item) => typeof item === 'string'))
      ),
    [endpoints]
  );

  return (
    <div>
      <div className='text-primary mb-2.5 flex items-center justify-between pl-2.5 text-base font-bold capitalize'>
        {group}

        <Switch
          size='sm'
          isSelected={isAllEnabled}
          onValueChange={(state) => {
            if (state) {
              enableNetworks(endpoints.filter((item) => !item.enabled).map((item) => item.key));
            } else {
              disableNetworks(endpoints.filter((item) => item.enabled).map((item) => item.key));
            }
          }}
        />
      </div>
      <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
        {endpoints.map((endpoint) => {
          const isCompletedMigration = completedMigrationNetworks.includes(endpoint.key);

          return (
            <Button
              key={endpoint.key}
              data-completed-migration={isCompletedMigration}
              fullWidth
              variant='light'
              radius='sm'
              color='secondary'
              size='lg'
              className='text-foreground bg-divider-300/30 data-[completed-migration=true]:text-foreground/30 data-[completed-migration=true]:hover:bg-divider-300/30 h-[52px] justify-start rounded-[10px] p-2.5 text-left font-bold shadow-none'
              style={{
                background: !isCompletedMigration ? 'var(--color-main-bg)' : undefined
              }}
              onClick={endpoint.enabled ? () => disableNetworks([endpoint.key]) : () => enableNetworks([endpoint.key])}
            >
              <Status network={endpoint} />
              <span className='flex-1'>{endpoint.name}</span>
              <div className='flex items-center gap-2'>
                {peopleNetworks.includes(endpoint.key) && (
                  <Tooltip
                    classNames={{ content: 'max-w-[320px]' }}
                    content='To correctly display your identity, People chain is connected.'
                  >
                    <IconQuestion />
                  </Tooltip>
                )}

                {isCompletedMigration && (
                  <Tooltip
                    classNames={{ content: 'max-w-[300px]' }}
                    content='Due to the Assethub Migration, this network is no longer the primary one for regular users. Please connect to Assethub instead.'
                  >
                    <IconQuestion className='text-primary' />
                  </Tooltip>
                )}

                <Switch
                  size='sm'
                  isSelected={endpoint.enabled}
                  onValueChange={(state) => {
                    if (state) {
                      enableNetworks([endpoint.key]);
                    } else {
                      disableNetworks([endpoint.key]);
                    }
                  }}
                />
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function OmniChainSelect() {
  const { isApiReady } = useApi();
  const { networks, enableNetwork, disableNetwork } = useNetworks();
  const { data: migrationNetworks } = useMigrationNetworks();

  const completedMigrationNetworks = useMemo(() => {
    return migrationNetworks?.filter((network) => network.status === 'completed').map((network) => network.chain) || [];
  }, [migrationNetworks]);

  const enabledNetworks = useMemo(() => networks.filter((network) => network.enabled), [networks]);
  const groupedEndpoints = useMemo(() => {
    const list = networks.reduce(
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

    // Sort networks within each group to put completed migration networks at the end
    Object.keys(list).forEach((groupKey) => {
      list[groupKey] = list[groupKey].sort((a, b) => {
        const aIsCompleted = completedMigrationNetworks.includes(a.key);
        const bIsCompleted = completedMigrationNetworks.includes(b.key);

        // If one is completed and the other is not, put completed at the end
        if (aIsCompleted && !bIsCompleted) return 1;
        if (!aIsCompleted && bIsCompleted) return -1;

        // If both are completed or both are not completed, maintain original order
        return 0;
      });
    });

    return list;
  }, [networks, completedMigrationNetworks]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='bordered'
          className='border-secondary text-primary sm:text-foreground bg-secondary h-[32px] shrink-0 gap-1 px-2.5 sm:h-[42px] sm:gap-2 sm:bg-transparent sm:px-3'
          radius='md'
          onClick={() => setIsOpen(!isOpen)}
        >
          <>
            <IconWebsite className='block sm:hidden' />
            <div className='hidden sm:block'>
              {isApiReady ? (
                enabledNetworks.length > 3 ? (
                  <div className='flex items-center'>
                    <Avatar
                      className='bg-transparent select-none'
                      style={{ width: 20, height: 20 }}
                      src={enabledNetworks[0].icon}
                    />
                    <Avatar
                      className='ml-[-10px] bg-transparent select-none'
                      style={{ width: 20, height: 20 }}
                      src={enabledNetworks[1].icon}
                    />
                    <Avatar
                      className='ml-[-10px] bg-transparent select-none'
                      style={{ width: 20, height: 20 }}
                      src={enabledNetworks[2].icon}
                    />
                    <Avatar
                      className='bg-primary border-divider-300 ml-[-10px] border-1 select-none'
                      style={{ width: 20, height: 20 }}
                      showFallback
                      fallback={
                        <svg xmlns='http://www.w3.org/2000/svg' width='11' height='2' viewBox='0 0 11 2' fill='none'>
                          <path
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M2.73975 1C2.73975 1.55228 2.29203 2 1.73975 2C1.18746 2 0.739746 1.55228 0.739746 1C0.739746 0.447715 1.18746 0 1.73975 0C2.29203 0 2.73975 0.447715 2.73975 1ZM6.73975 1C6.73975 1.55228 6.29203 2 5.73975 2C5.18746 2 4.73975 1.55228 4.73975 1C4.73975 0.447715 5.18746 0 5.73975 0C6.29203 0 6.73975 0.447715 6.73975 1ZM9.73975 2C10.292 2 10.7397 1.55228 10.7397 1C10.7397 0.447715 10.292 0 9.73975 0C9.18746 0 8.73975 0.447715 8.73975 1C8.73975 1.55228 9.18746 2 9.73975 2Z'
                            fill='white'
                          />
                        </svg>
                      }
                    />
                  </div>
                ) : (
                  <div className='flex items-center'>
                    {enabledNetworks.map((network, index) => (
                      <Avatar
                        className='bg-transparent select-none'
                        style={{ width: 20, height: 20, marginLeft: index > 0 ? '-10px' : 0 }}
                        src={network.icon}
                      />
                    ))}
                  </div>
                )
              ) : (
                <Spinner size='sm' />
              )}
            </div>
          </>
          <span className='hidden sm:block'>
            {isApiReady
              ? enabledNetworks.length > 1
                ? `${enabledNetworks.length} Networks`
                : `${enabledNetworks.at(0)?.name}`
              : 'Connecting...'}
          </span>
          <span className='block sm:hidden'>
            {isApiReady ? (enabledNetworks.length > 1 ? `${enabledNetworks.length}` : '') : 'Connecting...'}
          </span>
          {isApiReady ? <ArrowDown className='hidden sm:block' /> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent side='bottom' align='end' className='rounded-[20px] p-2.5'>
        <div className='scrollbar-hide max-h-[80dvh] w-[610px] max-w-[90vw] overflow-y-auto'>
          <div className='mb-5 flex flex-row-reverse'>
            <Button asChild variant='ghost' color='primary' onClick={() => setIsOpen(false)}>
              <Link to='/setting'>Customize RPC</Link>
            </Button>
          </div>
          <div className='space-y-2.5'>
            {Object.keys(groupedEndpoints).map((group) => (
              <GroupedEndpoints
                key={`group-${group}`}
                group={group}
                endpoints={groupedEndpoints[group]}
                completedMigrationNetworks={completedMigrationNetworks}
                enableNetworks={(networks) => networks.forEach((network) => enableNetwork(network))}
                disableNetworks={(networks) => networks.forEach((network) => disableNetwork(network))}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default OmniChainSelect;

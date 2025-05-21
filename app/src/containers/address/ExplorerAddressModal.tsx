// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import StatescanImg from '@/assets/images/statescan.svg';
import SubscanImg from '@/assets/images/subscan.svg';
import { Address } from '@/components';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMemo, useRef } from 'react';
import { useEffectOnce } from 'react-use';

import { chainLinks, type Network, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Divider, Drawer, DrawerBody, DrawerContent, Link, Modal, Tooltip, usePress } from '@mimir-wallet/ui';

function Item({ endpoint, address }: { endpoint: Network; address: string }) {
  const { ss58Chain } = useApi();
  const { pressProps } = usePress({
    onPress: () => {
      if (endpoint.explorerUrl) {
        window.open(
          chainLinks.accountExplorerLink(
            { ss58Format: endpoint.ss58Format, explorerUrl: endpoint.explorerUrl },
            address
          ),
          '_blank'
        );
      } else if (endpoint.statescanUrl) {
        window.open(
          chainLinks.accountExplorerLink(
            { ss58Format: endpoint.ss58Format, statescanUrl: endpoint.statescanUrl },
            address
          ),
          '_blank'
        );
      }
    }
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffectOnce(() => {
    if (ss58Chain === endpoint.key) {
      // scroll to the top of the page
      ref.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center'
      });
    }
  });

  return (
    <div
      data-selected={ss58Chain === endpoint.key}
      ref={ref}
      style={{
        background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)'
      }}
      className='cursor-pointer p-2 sm:p-2.5 rounded-medium flex items-center gap-1 sm:gap-2 data-[selected=true]:animate-blink-bg'
      {...pressProps}
    >
      <Avatar
        src={endpoint.icon}
        className='w-[20px] sm:w-[30px] h-[20px] sm:h-[30px]'
        style={{ backgroundColor: 'transparent' }}
      />
      <b className='text-small sm:text-medium'>{endpoint.name}</b>
      <div className='flex-1 text-foreground/50 text-tiny'>
        <Address value={address} shorten ss58Format={endpoint.ss58Format} />
      </div>
      {endpoint.explorerUrl && (
        <Tooltip content={'Subscan'} closeDelay={0}>
          <Link
            target='_blank'
            href={chainLinks.accountExplorerLink(
              { ss58Format: endpoint.ss58Format, explorerUrl: endpoint.explorerUrl },
              address
            )}
            rel='noreferrer'
          >
            <Avatar style={{ width: 20, height: 20, backgroundColor: 'transparent' }} src={SubscanImg} alt='subscan' />
          </Link>
        </Tooltip>
      )}
      {endpoint.statescanUrl && (
        <Tooltip content={'Statescan'} closeDelay={0}>
          <Link
            target='_blank'
            href={chainLinks.accountExplorerLink(
              { ss58Format: endpoint.ss58Format, statescanUrl: endpoint.statescanUrl },
              address
            )}
            rel='noreferrer'
          >
            <Avatar
              style={{ width: 20, height: 20, backgroundColor: 'transparent' }}
              src={StatescanImg}
              alt='subscan'
            />
          </Link>
        </Tooltip>
      )}
    </div>
  );
}

function GroupedNetwork({ address, group, endpoints }: { address: string; group: string; endpoints: Network[] }) {
  return (
    <div>
      <div className='text-primary capitalize mb-2.5 font-bold text-medium'>{group}</div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2.5'>
        {endpoints.map((endpoint) => (
          <Item key={endpoint.key} endpoint={endpoint} address={address} />
        ))}
      </div>
    </div>
  );
}

function ExplorerAddressModal() {
  const { isOpen, close, address } = useAddressExplorer();
  const { networks } = useNetworks();
  const upMd = useMediaQuery('md');

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

  if (!isOpen || !address) {
    return null;
  }

  const BaseComp = upMd ? Drawer : Modal;

  return (
    <BaseComp
      {...(upMd
        ? ({ placement: 'right', size: '2xl', scrollBehavior: 'inside' } as any)
        : ({ placement: 'bottom', scrollBehavior: 'inside', size: 'xl' } as any))}
      isOpen={isOpen}
      onClose={close}
    >
      <DrawerContent>
        <DrawerBody className='p-5 scrollbar-hide'>
          {Object.keys(groupedEndpoints).map((group, index) => (
            <>
              <GroupedNetwork
                key={`group-${group}`}
                address={address}
                group={group}
                endpoints={groupedEndpoints[group]}
              />

              {index > 0 && <Divider />}
            </>
          ))}
        </DrawerBody>
      </DrawerContent>
    </BaseComp>
  );
}

export default ExplorerAddressModal;

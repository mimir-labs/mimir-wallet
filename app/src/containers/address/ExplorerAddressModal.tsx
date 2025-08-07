// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address, ExplorerLink } from '@/components';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMemo, useRef } from 'react';
import { useEffectOnce } from 'react-use';

import { chainLinks, type Network, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Divider, Drawer, DrawerContent, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

function Item({ endpoint, address }: { endpoint: Network; address: string }) {
  const { ss58Chain } = useApi();
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
      className='data-[selected=true]:animate-blink-bg flex cursor-pointer items-center gap-1 rounded-[10px] p-2 sm:gap-2 sm:p-2.5'
      onClick={(e) => {
        e.stopPropagation();

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
      }}
    >
      <Avatar
        src={endpoint.icon}
        className='h-[20px] w-[20px] sm:h-[30px] sm:w-[30px]'
        style={{ backgroundColor: 'transparent' }}
      />
      <b className='text-sm sm:text-base'>{endpoint.name}</b>
      <div className='text-foreground/50 flex-1 text-xs'>
        <Address value={address} shorten ss58Format={endpoint.ss58Format} />
      </div>
      <ExplorerLink showAll chain={endpoint} address={address} />
    </div>
  );
}

function GroupedNetwork({ address, group, endpoints }: { address: string; group: string; endpoints: Network[] }) {
  return (
    <div>
      <div className='text-primary mb-2.5 text-base font-bold capitalize'>{group}</div>
      <div className='grid grid-cols-1 gap-2.5 md:grid-cols-2'>
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

  const content = Object.keys(groupedEndpoints).map((group, index) => (
    <>
      <GroupedNetwork key={`group-${group}`} address={address} group={group} endpoints={groupedEndpoints[group]} />

      {index > 0 && <Divider />}
    </>
  ));

  if (upMd) {
    return (
      <Drawer open={isOpen} onClose={close} direction='right'>
        <DrawerContent>
          <div className='flex flex-col gap-2.5 overflow-y-auto p-4'>{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Modal onClose={close} isOpen={isOpen}>
      <ModalContent>
        <ModalBody>{content}</ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default ExplorerAddressModal;

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconQrcode from '@/assets/svg/icon-qr.svg?react';
import IconStar from '@/assets/svg/icon-star.svg?react';
import { Address, CopyButton, ExplorerLink } from '@/components';
import { toastSuccess } from '@/components/utils';
import { SHOW_ALL_NETWORKS_IN_COPY_MODAL_KEY } from '@/constants';
import { useCopyAddress } from '@/hooks/useCopyAddress';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useQrAddress } from '@/hooks/useQrAddress';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';

import { encodeAddress, type Network, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { useLocalStore } from '@mimir-wallet/service';
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  DrawerContent,
  DrawerFooter,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Switch
} from '@mimir-wallet/ui';

function Item({ endpoint, address }: { endpoint: Network; address: string }) {
  const [, copy] = useCopyClipboard();
  const upSm = useMediaQuery('sm');
  const { ss58Chain, setSs58Chain } = useApi();
  const { open: openQr } = useQrAddress();
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
        copy(encodeAddress(address, endpoint.ss58Format));
        toastSuccess('Address copied', encodeAddress(address, endpoint.ss58Format));
      }}
    >
      <Avatar
        src={endpoint.icon}
        className='h-[20px] w-[20px] sm:h-[30px] sm:w-[30px]'
        style={{ backgroundColor: 'transparent' }}
      />
      <b className='text-sm sm:text-base'>{endpoint.name}</b>
      <div className='text-foreground/50 flex-1 text-xs'>
        <Address value={address} shorten={!upSm} ss58Format={endpoint.ss58Format} />
      </div>
      <ExplorerLink chain={endpoint} address={address} showAll={false} />
      <CopyButton size='sm' className='h-6 w-6 opacity-30' value={encodeAddress(address, endpoint.ss58Format)} />
      <Button isIconOnly size='sm' className='text-inherit' variant='light' onClick={() => openQr(address)}>
        <IconQrcode className='h-[16px] w-[16px] opacity-30' />
      </Button>
      <Button isIconOnly size='sm' className='text-inherit' variant='light' onClick={() => setSs58Chain(endpoint.key)}>
        <IconStar
          data-selected={ss58Chain === endpoint.key}
          className='data-[selected=true]:text-primary opacity-30 data-[selected=true]:opacity-100'
        />
      </Button>
    </div>
  );
}

function GroupedNetwork({ address, group, endpoints }: { address: string; group: string; endpoints: Network[] }) {
  return (
    <div>
      <div className='text-primary mb-2.5 text-base font-bold capitalize'>{group}</div>
      <div className='space-y-2.5'>
        {endpoints.map((endpoint) => (
          <Item key={endpoint.key} endpoint={endpoint} address={address} />
        ))}
      </div>
    </div>
  );
}

function CopyAddressModal() {
  const { isOpen, close, address } = useCopyAddress();
  const { networks } = useNetworks();
  const { ss58Chain } = useApi();
  const upMd = useMediaQuery('md');
  const [groupedEndpoints, setGroupedEndpoints] = useState<Record<string, Network[]>>({});
  const { meta } = useAddressMeta(address);
  const [showAll, setShowAll] = useLocalStore(SHOW_ALL_NETWORKS_IN_COPY_MODAL_KEY, false);

  useEffect(() => {
    if (isOpen) {
      const groupedEndpoints = networks
        .filter((item) => (showAll ? true : !!item.enabled))
        .reduce(
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

      const polkadotNetworks = groupedEndpoints['polkadot'] || [];
      const selectedNetwork = polkadotNetworks.find((network) => network.key === ss58Chain);

      if (selectedNetwork && polkadotNetworks.indexOf(selectedNetwork) < 3) {
        const index = polkadotNetworks.indexOf(selectedNetwork);

        polkadotNetworks.splice(index, 1);
        polkadotNetworks.splice(3, 0, selectedNetwork);
      }

      setGroupedEndpoints(groupedEndpoints);
    }
  }, [isOpen, networks, showAll, ss58Chain]);

  if (!isOpen || !address) {
    return null;
  }

  let content: ReactNode;

  if (meta.isPure) {
    const network = networks.find((network) => network.genesisHash === meta.pureCreatedAt);

    if (!network) {
      return null;
    }

    content = (
      <div>
        <div className='text-primary mb-2.5 text-base font-bold capitalize'>{network?.name}</div>
        <div className='space-y-2.5'>
          <Item endpoint={network} address={address} />
        </div>
      </div>
    );
  } else {
    content = Object.keys(groupedEndpoints).map((group, index) => (
      <>
        {index > 0 && <Divider />}

        <GroupedNetwork key={`group-${group}`} address={address} group={group} endpoints={groupedEndpoints[group]} />
      </>
    ));
  }

  if (upMd) {
    return (
      <Drawer open={isOpen} onClose={close} direction='right'>
        <DrawerContent>
          <div className='overflow-y-auto p-4'>{content}</div>
          <DrawerFooter>
            <Switch
              className='w-full max-w-full flex-row-reverse justify-between'
              size='sm'
              classNames={{
                label: 'm-0'
              }}
              isSelected={showAll}
              onValueChange={setShowAll}
            >
              Show All Networks
            </Switch>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Modal onClose={close} isOpen={isOpen}>
      <ModalContent>
        <ModalBody>{content}</ModalBody>
        <ModalFooter>
          <Switch
            className='w-full max-w-full flex-row-reverse justify-between'
            size='sm'
            classNames={{
              label: 'm-0'
            }}
            isSelected={showAll}
            onValueChange={setShowAll}
          >
            Show All Networks
          </Switch>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CopyAddressModal;

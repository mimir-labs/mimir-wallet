// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconQrcode from '@/assets/svg/icon-qr.svg?react';
import IconStar from '@/assets/svg/icon-star.svg?react';
import { Address, CopyButton } from '@/components';
import { toastSuccess } from '@/components/utils';
import { useCopyAddress } from '@/hooks/useCopyAddress';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useQrAddress } from '@/hooks/useQrAddress';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';

import { encodeAddress, type Network, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Divider, Drawer, DrawerBody, DrawerContent, Modal, usePress } from '@mimir-wallet/ui';

function Item({ endpoint, address }: { endpoint: Network; address: string }) {
  const [, copy] = useCopyClipboard();
  const upSm = useMediaQuery('sm');
  const { ss58Chain, setSs58Chain } = useApi();
  const { open: openQr } = useQrAddress();
  const { pressProps } = usePress({
    onPress: () => {
      copy(encodeAddress(address, endpoint.ss58Format));
      toastSuccess('Address copied', encodeAddress(address, endpoint.ss58Format));
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
      className='rounded-medium data-[selected=true]:animate-blink-bg flex cursor-pointer items-center gap-1 p-2 sm:gap-2 sm:p-2.5'
      {...pressProps}
    >
      <Avatar
        src={endpoint.icon}
        className='h-[20px] w-[20px] sm:h-[30px] sm:w-[30px]'
        style={{ backgroundColor: 'transparent' }}
      />
      <b className='text-small sm:text-medium'>{endpoint.name}</b>
      <div className='text-foreground/50 text-tiny flex-1'>
        <Address value={address} shorten={!upSm} ss58Format={endpoint.ss58Format} />
      </div>
      <CopyButton size='sm' className='h-6 w-6 opacity-30' value={encodeAddress(address, endpoint.ss58Format)} />
      <Button isIconOnly size='sm' color='default' variant='light' onPress={() => openQr(address)}>
        <IconQrcode className='h-[16px] w-[16px] opacity-30' />
      </Button>
      <Button isIconOnly size='sm' color='default' variant='light' onPress={() => setSs58Chain(endpoint.key)}>
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
      <div className='text-primary text-medium mb-2.5 font-bold capitalize'>{group}</div>
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

  useEffect(() => {
    if (!isOpen) {
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

      const polkadotNetworks = groupedEndpoints['polkadot'] || [];
      const selectedNetwork = polkadotNetworks.find((network) => network.key === ss58Chain);

      if (selectedNetwork && polkadotNetworks.indexOf(selectedNetwork) < 3) {
        const index = polkadotNetworks.indexOf(selectedNetwork);

        polkadotNetworks.splice(index, 1);
        polkadotNetworks.splice(3, 0, selectedNetwork);
      }

      setGroupedEndpoints(groupedEndpoints);
    }
  }, [isOpen, networks, ss58Chain]);

  if (!isOpen || !address) {
    return null;
  }

  const BaseComp = upMd ? Drawer : Modal;

  let content: ReactNode;

  if (meta.isPure) {
    const network = networks.find((network) => network.genesisHash === meta.pureCreatedAt);

    if (!network) {
      return null;
    }

    content = (
      <div>
        <div className='text-primary text-medium mb-2.5 font-bold capitalize'>{network?.name}</div>
        <div className='space-y-2.5'>
          <Item endpoint={network} address={address} />
        </div>
      </div>
    );
  } else {
    content = Object.keys(groupedEndpoints).map((group, index) => (
      <>
        <GroupedNetwork key={`group-${group}`} address={address} group={group} endpoints={groupedEndpoints[group]} />

        {index > 0 && <Divider />}
      </>
    ));
  }

  return (
    <BaseComp
      {...(upMd
        ? ({ placement: 'right', size: '2xl', scrollBehavior: 'inside' } as any)
        : ({ placement: 'bottom', scrollBehavior: 'inside', size: 'xl' } as any))}
      isOpen={isOpen}
      onClose={close}
    >
      <DrawerContent>
        <DrawerBody className='scrollbar-hide p-5'>{content}</DrawerBody>
      </DrawerContent>
    </BaseComp>
  );
}

export default CopyAddressModal;

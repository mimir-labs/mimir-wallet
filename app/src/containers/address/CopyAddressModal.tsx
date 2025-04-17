// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconQrcode from '@/assets/svg/icon-qr.svg?react';
import IconStar from '@/assets/svg/icon-star.svg?react';
import { Address, CopyButton } from '@/components';
import { useCopyAddress } from '@/hooks/useCopyAddress';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useQrAddress } from '@/hooks/useQrAddress';
import { useMemo } from 'react';

import { type Network, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Divider, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

function GroupedNetwork({ address, group, endpoints }: { address: string; group: string; endpoints: Network[] }) {
  const upSm = useMediaQuery('sm');
  const { ss58Chain, setSs58Chain } = useApi();
  const { open: openQr } = useQrAddress();

  return (
    <div>
      <div className='text-primary capitalize mb-2.5 font-bold text-medium'>{group}</div>
      <div className='space-y-2.5'>
        {endpoints.map((endpoint) => (
          <div
            style={{
              background: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)'
            }}
            className='p-2 sm:p-2.5 rounded-medium flex items-center gap-1 sm:gap-2'
            key={endpoint.key}
          >
            <Avatar
              src={endpoint.icon}
              className='w-[20px] sm:w-[30px] h-[20px] sm:h-[30px]'
              style={{ backgroundColor: 'transparent' }}
            />
            <b className='text-small sm:text-medium'>{endpoint.name}</b>
            <div className='flex-1 text-foreground/50 text-tiny'>
              <Address value={address} shorten={!upSm} ss58Format={endpoint.ss58Format} />
            </div>
            <CopyButton size='sm' className='w-6 h-6 opacity-30' value={address} />
            <Button isIconOnly size='sm' color='default' variant='light' onPress={() => openQr(address)}>
              <IconQrcode className='w-[16px] h-[16px] opacity-30' />
            </Button>
            <Button isIconOnly size='sm' color='default' variant='light' onPress={() => setSs58Chain(endpoint.key)}>
              <IconStar
                data-selected={ss58Chain === endpoint.key}
                className='data-[selected=true]:text-primary opacity-30 data-[selected=true]:opacity-100'
              />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyAddressModal() {
  const { isOpen, close, address } = useCopyAddress();
  const { networks } = useNetworks();

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

  if (!address) {
    return null;
  }

  return (
    <Modal size='2xl' scrollBehavior='inside' isOpen={isOpen} onClose={close} hideCloseButton>
      <ModalContent>
        <ModalBody className='p-5 scrollbar-hide'>
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default CopyAddressModal;

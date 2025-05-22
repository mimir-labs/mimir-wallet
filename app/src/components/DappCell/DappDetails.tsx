// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';

import IconMatrix from '@/assets/images/matrix.svg?react';
import IconDiscord from '@/assets/svg/icon-discord.svg?react';
import IconGithub from '@/assets/svg/icon-github.svg?react';
import IconWebsite from '@/assets/svg/icon-website.svg?react';
import IconX from '@/assets/svg/icon-x.svg?react';
import React from 'react';

import { Button, Divider, Link, Modal, ModalBody, ModalContent, ModalFooter } from '@mimir-wallet/ui';

import SupportedChains from './SupportedChains';

interface Props {
  open: boolean;
  dapp: DappOption;
  onClose: () => void;
  onOpen: () => void;
}

function Contents({ dapp }: { dapp: DappOption }) {
  return (
    <ModalBody>
      <div className='space-y-2.5 relative overflow-hidden'>
        <div className='absolute right-0 top-0 flex items-center'>
          Supported On <SupportedChains app={dapp} />
        </div>
        <img src={dapp.icon} className='w-[64px] h-[64px]' />
        <h3>{dapp.name}</h3>
        <div className='flex items-center gap-2.5'>
          {dapp.tags?.map((tag, index) => (
            <Button color='secondary' key={index} size='sm'>
              {tag}
            </Button>
          ))}
          <Divider orientation='vertical' className='h-[12px]' />
          {dapp.website && (
            <Button isIconOnly color='secondary' as={Link} href={dapp.website} size='sm' target='_blank'>
              <IconWebsite className='w-4 h-4' />
            </Button>
          )}
          {dapp.github && (
            <Button isIconOnly color='secondary' as={Link} href={dapp.github} size='sm' target='_blank'>
              <IconGithub className='w-4 h-4' />
            </Button>
          )}
          {dapp.discord && (
            <Button isIconOnly color='secondary' as={Link} href={dapp.discord} size='sm' target='_blank'>
              <IconDiscord className='w-4 h-4' />
            </Button>
          )}
          {dapp.twitter && (
            <Button isIconOnly color='secondary' as={Link} href={dapp.twitter} size='sm' target='_blank'>
              <IconX className='w-4 h-4' />
            </Button>
          )}
          {dapp.matrix && (
            <Button isIconOnly color='secondary' as={Link} href={dapp.matrix} size='sm' target='_blank'>
              <IconMatrix className='w-4 h-4' />
            </Button>
          )}
        </div>
        <h6 className='font-medium'>{dapp.description}</h6>
      </div>
    </ModalBody>
  );
}

function DappDetails({ dapp, onClose, onOpen, open }: Props) {
  return (
    <Modal size='lg' hideCloseButton onClose={onClose} isOpen={open}>
      <ModalContent>
        <Contents dapp={dapp} />
        <ModalFooter className='justify-center'>
          <Button size='lg' className='w-[195px]' onPress={onOpen}>
            Open
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(DappDetails);

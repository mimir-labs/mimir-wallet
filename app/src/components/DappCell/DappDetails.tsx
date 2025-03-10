// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconMatrix from '@/assets/images/matrix.svg?react';
import IconDiscord from '@/assets/svg/icon-discord.svg?react';
import IconGithub from '@/assets/svg/icon-github.svg?react';
import IconWebsite from '@/assets/svg/icon-website.svg?react';
import IconX from '@/assets/svg/icon-x.svg?react';
import { allEndpoints, type DappOption } from '@/config';
import { SvgIcon } from '@mui/material';
import { isArray } from '@polkadot/util';
import React from 'react';

import { Avatar, Button, Divider, Modal, ModalBody, ModalContent, ModalFooter } from '@mimir-wallet/ui';

interface Props {
  open: boolean;
  dapp: DappOption;
  onClose: () => void;
  onOpen: () => void;
}

function SupportedChains({ supported }: { supported: string[] | true }) {
  return (
    <div className='absolute right-0 top-0 flex items-center'>
      <p className='mr-2.5'>Supported on</p>
      {isArray(supported)
        ? supported.map((network) => (
            <Avatar
              key={network}
              src={allEndpoints.find((item) => item.key === network)?.icon}
              className='w-[16px] h-[16px] -ml-1 bg-background-default border-1 border-white'
            />
          ))
        : 'All Chains'}
    </div>
  );
}

function Contents({ dapp }: { dapp: DappOption }) {
  return (
    <ModalBody>
      <div className='space-y-2.5 relative overflow-hidden'>
        <SupportedChains supported={dapp.supportedChains} />
        <Avatar radius='md' src={dapp.icon} className='w-[64px] h-[64px]' />
        <h3>{dapp.name}</h3>
        <div className='flex items-center gap-2.5'>
          {dapp.tags?.map((tag, index) => (
            <Button color='secondary' key={index} size='sm'>
              {tag}
            </Button>
          ))}
          <Divider orientation='vertical' className='h-[12px]' />
          {dapp.website && (
            <Button isIconOnly color='secondary' as='a' href={dapp.website} size='sm' target='_blank'>
              <SvgIcon component={IconWebsite} inheritViewBox />
            </Button>
          )}
          {dapp.github && (
            <Button isIconOnly color='secondary' as='a' href={dapp.github} size='sm' target='_blank'>
              <SvgIcon component={IconGithub} inheritViewBox />
            </Button>
          )}
          {dapp.discord && (
            <Button isIconOnly color='secondary' as='a' href={dapp.discord} size='sm' target='_blank'>
              <SvgIcon component={IconDiscord} inheritViewBox />
            </Button>
          )}
          {dapp.twitter && (
            <Button isIconOnly color='secondary' as='a' href={dapp.twitter} size='sm' target='_blank'>
              <SvgIcon component={IconX} inheritViewBox />
            </Button>
          )}
          {dapp.matrix && (
            <Button isIconOnly color='secondary' as='a' href={dapp.matrix} size='sm' target='_blank'>
              <SvgIcon component={IconMatrix} inheritViewBox />
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

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from '@mimir-wallet/ui';

import AccountCard from './AccountCard';

interface Props {
  isOpen: boolean;
  onConfirm: (pureName: string, staticName: string, hide: boolean) => void;
  pureAddress: string;
  multisigAddress: string;
}

function AccountVisibility({ isOpen, onConfirm, pureAddress, multisigAddress }: Props) {
  const [pureName, setPureName] = useState('');
  const [multisigName, setMultisigName] = useState('');
  const [hide, setHide] = useState(true);
  const { network } = useApi();
  const { setAccountName, hideAccount } = useAccount();

  return (
    <Modal size='lg' hideCloseButton isOpen={isOpen}>
      <ModalContent>
        <ModalHeader className='text-xl font-extrabold'>Account Visibility</ModalHeader>

        <ModalBody className='flex flex-col gap-[15px] py-0'>
          <Divider className='bg-primary/5' />

          <p className='text-foreground text-sm'>
            The proxy is your everyday account. The Multisig stays in the background for security and is safe to
            hide.&nbsp;
            <a
              href='https://docs.mimir.global/basic/accounts#id-2.1-account-visibility'
              className='hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              Details&gt;&gt;
            </a>
          </p>

          <Divider className='bg-primary/5' />

          <AccountCard label='Pure Proxy' address={pureAddress} onNameChange={setPureName} placeholder='Test Account' />

          <AccountCard
            label='Multisig'
            address={multisigAddress}
            onNameChange={setMultisigName}
            placeholder='Test Account-Static'
          />

          <div className='space-y-[5px]'>
            <div className='flex items-center justify-between gap-6'>
              <b className='text-foreground text-sm'>Hide Multisig</b>
              <Switch
                classNames={{
                  wrapper: 'bg-primary/5 data-[selected=true]:bg-primary',
                  thumb: 'bg-white'
                }}
                size='sm'
                isSelected={hide}
                onValueChange={setHide}
              />
            </div>

            <span className='text-foreground/50 text-xs'>Hide from account list (can unhide in Settings anytime).</span>
          </div>
          <Divider className='bg-primary/5' />
        </ModalBody>

        <ModalFooter>
          <Button
            fullWidth
            color='primary'
            variant='solid'
            radius='full'
            className='bg-primary text-primary-foreground h-8'
            onClick={() => {
              service.account.updateAccountName(network, pureAddress, pureName);
              service.account.updateAccountName(network, multisigAddress, multisigName);
              setAccountName(pureAddress, pureName);
              setAccountName(multisigAddress, multisigName);

              if (hide) {
                hideAccount(multisigAddress);
              }

              onConfirm(pureName, multisigName, hide);
            }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AccountVisibility;

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NEW_FEATURE_TIP_KEY } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { useLocalStore } from '@mimir-wallet/service';
import { Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs } from '@mimir-wallet/ui';

function OmniChainUpgradeTip() {
  const [isRead, setIsRead] = useLocalStore<boolean>(NEW_FEATURE_TIP_KEY, false);
  const upSm = useMediaQuery('sm');

  if (isRead) return null;

  return (
    <Modal isOpen size='3xl' onClose={() => setIsRead(true)}>
      <ModalContent>
        <ModalHeader className='text-xl font-bold'>✨New Features</ModalHeader>
        <ModalBody>
          <Tabs
            color='secondary'
            variant='light'
            placement={upSm ? 'start' : 'bottom'}
            classNames={{
              tab: 'justify-start',
              panel: 'space-y-5'.concat(upSm ? ' border-l-1 border-l-secondary pl-3' : '')
            }}
          >
            <Tab key='remoteProxy' title='Remote Proxy'>
              <div className='bg-secondary flex items-center justify-center rounded-[10px] p-5'>
                <video
                  src='https://mimir-labs.github.io/mimir-assets/videos/Remoteproxy2.mp4'
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  className='pointer-events-none h-auto max-w-full'
                />
              </div>
              <p className='text-foreground font-bold'>
                Instead of setting up proxy accounts on each parachain, remote-proxy module allows you to create it once
                on the Relay Chain — then compatible parachains can automatically inherit that proxy. Now it supports{' '}
                {'Kusama<>Kusama Assethub'}.
              </p>
            </Tab>
            <Tab key='omniUX' title='OmniUX'>
              <div className='bg-secondary flex items-center justify-center rounded-[10px] p-5'>
                <video
                  src='https://mimir-labs.github.io/mimir-assets/videos/OmniUX.mp4'
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  className='pointer-events-none h-auto max-w-full'
                />
              </div>
              <p className='text-foreground font-bold'>
                Seamless management of multi-sig accounts across multiple parachains, enabling a unified cross-chain
                experience.
              </p>
            </Tab>
            <Tab key='callTemplate' title='Call Template'>
              <div className='bg-secondary flex items-center justify-center rounded-[10px] p-5'>
                <video
                  src='https://mimir-labs.github.io/mimir-assets/videos/CallTemplate.mp4'
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  className='pointer-events-none h-auto max-w-full'
                />
              </div>
              <p className='text-foreground font-bold'>
                Predefined transaction templates simplify common DAO & team operations, eliminating the need for manual
                data input each time.
              </p>
            </Tab>
            <Tab key='walletConnect' title='WalletConnect'>
              <div className='bg-secondary flex items-center justify-center rounded-[10px] p-5'>
                <video
                  src='https://mimir-labs.github.io/mimir-assets/videos/WalletConnect.mp4'
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  className='pointer-events-none h-auto max-w-full'
                />
              </div>
              <p className='text-foreground font-bold'>
                Mimir integrates Wallet Connect, enabling direct multisig interaction with Dapps, allowing users to sign
                and approve transactions seamlessly.
              </p>
            </Tab>
            <Tab key='quickSimulation' title='Quick Simulation'>
              <div className='bg-secondary flex items-center justify-center rounded-[10px] p-5'>
                <video
                  src='https://mimir-labs.github.io/mimir-assets/videos/QuickSimulation.mp4'
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  className='pointer-events-none h-auto max-w-full'
                />
              </div>
              <p className='text-foreground font-bold'>
                Run a transaction simulation in 1–2 seconds and instantly display changes in account balances.
              </p>
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default OmniChainUpgradeTip;

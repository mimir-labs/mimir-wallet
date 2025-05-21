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
            <Tab key='omniUX' title='OmniUX'>
              <div className='flex items-center justify-center rounded-medium bg-secondary p-5'>
                <img src='https://mimir-labs.github.io/mimir-assets/images/OmniUX.gif' />
              </div>
              <p className='font-bold text-foreground'>
                Seamless management of multi-sig accounts across multiple parachains, enabling a unified cross-chain
                experience.
              </p>
            </Tab>
            <Tab key='callTemplate' title='Call Template'>
              <div className='flex items-center justify-center rounded-medium bg-secondary p-5'>
                <img src='https://mimir-labs.github.io/mimir-assets/images/Template.gif' />
              </div>
              <p className='font-bold text-foreground'>
                Predefined transaction templates simplify common DAO & team operations, eliminating the need for manual
                data input each time.
              </p>
            </Tab>
            <Tab key='walletConnect' title='WalletConnect'>
              <div className='flex items-center justify-center rounded-medium bg-secondary p-5'>
                <img src='https://mimir-labs.github.io/mimir-assets/images/WalletConnect.gif' />
              </div>
              <p className='font-bold text-foreground'>
                Mimir integrates Wallet Connect, enabling direct multisig interaction with Dapps, allowing users to sign
                and approve transactions seamlessly.
              </p>
            </Tab>
            <Tab key='quickSimulation' title='Quick Simulation'>
              <div className='flex items-center justify-center rounded-medium bg-secondary p-5'>
                <img src='https://mimir-labs.github.io/mimir-assets/images/Simulation.gif' />
              </div>
              <p className='font-bold text-foreground'>
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

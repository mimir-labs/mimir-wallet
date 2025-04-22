// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { OMNI_CHAIN_UPGRADE_TIP_KEY } from '@/constants';

import { useLocalStore } from '@mimir-wallet/service';
import { Button, Divider, Link, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

function OmniChainUpgradeTip() {
  const [isRead, setIsRead] = useLocalStore<boolean>(OMNI_CHAIN_UPGRADE_TIP_KEY, false);

  if (isRead) return null;

  return (
    <Modal scrollBehavior='inside' isOpen size='3xl' hideCloseButton>
      <ModalContent>
        <ModalBody className='flex flex-col sm:flex-row items-center gap-5 sm:gap-10 scrollbar-hide'>
          <img src='/images/omni-chain-upgrade-img.webp' alt='mimir omni chain upgrade' style={{ width: 335 }} />
          <div className='space-y-5'>
            <h3>Omni-Chain Version</h3>
            <Divider />

            <p>
              Polkadot’s multi-chain interoperability is a key strength—and now Mimir brings that same seamless
              experience to multisig.
            </p>

            <div style={{ width: 288 }} className='p-2 rounded-[15px] bg-secondary mx-auto'>
              <img src='/images/omni-chain-upgrade-tip.webp' alt='mimir omni chain upgrade' />
            </div>

            <p>
              Set your connection once, and you can send transactions across any supported network without
              switching—just like with single-signature wallets.
            </p>

            <Divider />

            <div>
              <Button color='primary' fullWidth onPress={() => setIsRead(true)}>
                Love It!
              </Button>
              <Link
                as='button'
                color='primary'
                size='sm'
                className='flex w-full justify-center mt-2.5'
                onPress={() => setIsRead(true)}
              >
                Close but also love it
              </Link>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default OmniChainUpgradeTip;

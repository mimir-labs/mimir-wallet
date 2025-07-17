// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { AddressOverview, InputNetwork } from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

function Relation({ address, setNetwork }: { address: string; setNetwork: (network: string) => void }) {
  const { network } = useApi();
  const [account] = useQueryAccount(address);
  const ref = useRef<HTMLDivElement>(null);
  const upSm = useMediaQuery('sm');
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <>
      <div
        ref={ref}
        className='xs:h-[calc(100dvh-500px)] rounded-medium shadow-medium bg-content1 relative h-[calc(100dvh-400px)] min-h-[360px] w-full'
      >
        <Button variant='light' className='absolute z-[1] inline-flex sm:hidden' onPress={toggleOpen}>
          Overview
        </Button>
        <div className='bg-content1 absolute top-4 right-4 z-[1] w-[200px]'>
          <InputNetwork network={network} setNetwork={setNetwork} />
        </div>
        <AddressOverview key={account?.address || 'none'} account={account} showControls={upSm} showMiniMap={upSm} />
      </div>
      <Modal size='full' isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader>Overview</ModalHeader>
          <ModalBody>
            <div className='bg-secondary h-full w-full'>
              <AddressOverview
                key={`${account?.address}.${network}`}
                account={account}
                showControls
                showMiniMap={false}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default React.memo(Relation);

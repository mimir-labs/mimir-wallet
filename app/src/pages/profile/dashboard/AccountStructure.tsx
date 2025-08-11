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
        className='xs:h-[calc(100dvh-500px)] bg-content1 border-secondary shadow-medium relative h-[300px] min-h-[360px] w-full rounded-[20px] border-1'
      >
        <Button variant='light' className='absolute z-[1] inline-flex sm:hidden' onClick={toggleOpen}>
          Overview
        </Button>
        <div className='bg-content1 absolute top-4 right-4 z-[1] w-[200px]'>
          <InputNetwork network={network} setNetwork={setNetwork} />
        </div>
        <AddressOverview key={account?.address || 'none'} account={account} showControls={upSm} showMiniMap={false} />
      </div>
      <Modal size='5xl' isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader>Overview</ModalHeader>
          <ModalBody>
            <div className='bg-secondary h-[80dvh] w-full'>
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

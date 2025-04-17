// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQueryAccount } from '@/accounts/useQueryAccount';
import { AddressOverview, InputNetwork } from '@/components';
import { useMediaQuery, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

function Relation({ address, setNetwork }: { address: string; setNetwork: (network: string) => void }) {
  const { network } = useApi();
  const [account] = useQueryAccount(address);
  const ref = useRef<HTMLDivElement>(null);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <>
      <div
        ref={ref}
        className='relative w-full min-h-[360px] h-[calc(100dvh-400px)] xs:h-[calc(100dvh-500px)] rounded-medium shadow-medium bg-content1'
      >
        <Button variant='light' className='z-[1] absolute inline-flex sm:hidden' onPress={toggleOpen}>
          Overview
        </Button>
        <div className='z-[1] w-[200px] absolute right-4 top-4'>
          <InputNetwork network={network} setNetwork={setNetwork} />
        </div>
        <AddressOverview
          key={account?.address || 'none'}
          account={account}
          showControls={!downSm}
          showMiniMap={!downSm}
        />
      </div>
      <Modal size='full' isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader>Overview</ModalHeader>
          <ModalBody>
            <div className='w-full h-full'>
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

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';

import { allEndpoints, type Endpoint } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

interface Props {
  network: string;
  open: boolean;
  onClose: () => void;
  onOpen: (network: Endpoint) => void;
}

function SwitchChain({ network, onClose, onOpen, open }: Props) {
  const endpoint = useMemo(() => allEndpoints.find((item) => item.key === network), [network]);

  return (
    <Modal size='xl' onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader>Switch Network</ModalHeader>
        <ModalBody>
          <div className='space-y-5'>
            <p>
              This app has been migrated to the {endpoint?.name}. To continue using it, please switch to the following
              network.
            </p>
            <div className='flex justify-center items-center gap-2.5 p-2.5 rounded-medium border-1 border-secondary'>
              <Avatar className='bg-transparent w-[20px] h-[20px]' src={endpoint?.icon} />
              {endpoint?.name}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button fullWidth size='lg' onPress={endpoint ? () => onOpen(endpoint) : undefined}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(SwitchChain);

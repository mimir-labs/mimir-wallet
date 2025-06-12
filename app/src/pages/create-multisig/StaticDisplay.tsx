// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Input } from '@/components';
import { useState } from 'react';

import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from '@mimir-wallet/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, hide: boolean) => void;
}

function StaticDisplay({ isOpen, onClose, onConfirm }: Props) {
  const [name, setName] = useState('');
  const [hide, setHide] = useState(true);

  return (
    <Modal size='md' hideCloseButton isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Static Multisig Display</ModalHeader>

        <Divider />

        <ModalBody className='flex flex-col gap-5'>
          <p className='text-tiny'>
            Creating a Flexible Multisig also generates a linked Static Multisig, which you control. You can name it and
            choose whether to show it in your account list.
          </p>

          <Input label='Name' placeholder='Enter a name for your static multisig' value={name} onChange={setName} />

          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-2'>
              <b>Hide Static Multisig</b>
              <Switch isSelected={hide} onValueChange={setHide} />
            </div>

            <span className='text-tiny text-foreground/50'>
              Don’t show it in account list. You can unhide it in Setting once you want.
            </span>
          </div>
        </ModalBody>

        <Divider />

        <ModalFooter>
          <Button
            fullWidth
            color='primary'
            onPress={() => {
              onConfirm(name, hide);
            }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default StaticDisplay;

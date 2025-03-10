// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressMeta } from '@/accounts/useAddressMeta';
import React from 'react';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

import Input from './Input';
import { toastSuccess } from './utils';

function Content({ address, onClose }: { address: string; onClose?: () => void }) {
  const { name, saveName, setName } = useAddressMeta(address);

  return (
    <>
      <ModalBody>
        <div className='space-y-5'>
          <Input label='Name' onChange={setName} placeholder='input name for contact' value={name} />
          <Input disabled label='Address' placeholder='input address' value={address} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button fullWidth onPress={onClose} variant='ghost'>
          Cancel
        </Button>
        <Button
          isDisabled={!(name && address)}
          fullWidth
          onPress={() => {
            onClose?.();
            saveName((name) => toastSuccess(`Save name to ${name} success`));
          }}
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
}

function AddAddressDialog({ address, onClose, open }: { address: string; open: boolean; onClose?: () => void }) {
  return (
    <Modal size='xl' onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader>
          <h4>Edit Name</h4>
        </ModalHeader>
        <Content address={address} onClose={onClose} />
      </ModalContent>
    </Modal>
  );
}

export default React.memo(AddAddressDialog);

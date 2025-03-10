// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import NormalImg from '@/assets/images/normal.webp';
import OneOfOneImg from '@/assets/images/oneofone.webp';
import React from 'react';
import { Link } from 'react-router-dom';

import { Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

function CreateMultisigDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal size='2xl' isOpen={open} onClose={onClose} autoFocus>
      <ModalContent>
        <ModalHeader>Select Multisig Account Type</ModalHeader>
        <ModalBody className='flex flex-row gap-5 pb-5'>
          <Link
            className='rounded-medium w-full flex flex-col items-center gap-2.5 p-2.5 pt-5 bg-secondary text-center no-underline text-foreground'
            onClick={onClose}
            to='/create-multisig'
          >
            <img style={{ borderRadius: 25 }} src={NormalImg} width={50} height={50} alt='normal multisig' />
            <h4>Normal Multisig</h4>
            <div className='w-full'>Multisig with {'Threshold > 1'}</div>
          </Link>
          <Link
            className='rounded-medium w-full flex flex-col items-center gap-2.5 p-2.5 pt-5 bg-secondary text-center no-underline text-foreground'
            onClick={onClose}
            to='/create-multisig-one'
          >
            <img style={{ borderRadius: 25 }} src={OneOfOneImg} width={50} height={50} alt='normal multisig' />
            <h4>1/N Multisig</h4>
            <div className='w-full'>Multisig with Threshold = 1</div>
          </Link>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(CreateMultisigDialog);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { AddressCell, CongratsAnimation } from '@/components';
import { useNavigate } from 'react-router-dom';

import { Button, Divider, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

interface Props {
  address: string;
  isOpen: boolean;
  onClose: () => void;
}

function CreateSuccess({ isOpen, onClose, address }: Props) {
  const navigate = useNavigate();
  const { setCurrent } = useAccount();

  useQueryAccountOmniChain(address);

  return (
    <Modal size='md' isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalBody className='flex flex-col items-center gap-5 py-10'>
          <CongratsAnimation />
          <h4 className='font-extrabold text-xl'>Your Account was successfully created!</h4>

          <Divider />

          <div className='flex self-stretch items-center gap-2.5'>
            <div className='w-[8px] h-[8px] rounded-full bg-success' />
            <AddressCell withCopy shorten={false} value={address} />
          </div>

          <Divider />

          <Button
            className='w-1/2'
            variant='solid'
            color='primary'
            radius='full'
            onPress={() => {
              onClose();
              setCurrent(address);
              navigate('/');
            }}
          >
            Start using
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default CreateSuccess;

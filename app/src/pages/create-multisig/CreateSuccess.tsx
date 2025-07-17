// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { AddressCell } from '@/components';
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
  const { meta } = useAddressMeta(address);

  useQueryAccountOmniChain(address);

  return (
    <Modal size='md' isOpen={isOpen} hideCloseButton closeButton={false}>
      <ModalContent>
        <ModalBody className='flex flex-col items-center gap-5 py-10'>
          <div className='bg-primary flex h-[120px] w-[120px] items-center justify-center rounded-[30px]'>
            <img src='/images/congrats.png' className='w-20' />
          </div>

          <h4 className='text-xl font-extrabold'>Your Account was successfully created!</h4>

          <Divider />

          <div className='bg-secondary rounded-medium flex items-center gap-2.5 self-stretch p-2.5'>
            <div className='bg-success h-[8px] w-[8px] rounded-full' />
            <AddressCell withCopy shorten={false} value={address} />
          </div>

          {meta.delegatees?.map((delegatee, index) => (
            <div key={index} className='bg-secondary rounded-medium flex items-center gap-2.5 self-stretch p-2.5'>
              <div className='bg-success h-[8px] w-[8px] rounded-full' />
              <AddressCell withCopy shorten={false} value={delegatee} />
            </div>
          ))}

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

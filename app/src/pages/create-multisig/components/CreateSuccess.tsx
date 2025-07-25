// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import { useQueryAccountOmniChain } from '@/accounts/useQueryAccount';
import { AddressCell } from '@/components';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { Button, Modal, ModalBody, ModalContent, Tooltip } from '@mimir-wallet/ui';

interface Props {
  address: string;
  isOpen: boolean;
  onClose: () => void;
}

function HideIcon({ address }: { address: string }) {
  const { hideAccountHex, hideAccount, showAccount } = useAccount();
  const addressHex = useMemo(() => addressToHex(address), [address]);
  const isHidden = useMemo(() => hideAccountHex.includes(addressHex), [hideAccountHex, addressHex]);

  return isHidden ? (
    <Tooltip content='Hidden'>
      <Button size='sm' variant='light' isIconOnly onPress={() => showAccount(address)}>
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='13' viewBox='0 0 20 13' fill='none'>
          <path
            d='M9.94933 10.163C10.9909 10.1774 11.8813 9.82507 12.6205 9.10606C13.3596 8.38705 13.7364 7.50676 13.7508 6.4652C13.7653 5.42363 13.413 4.53325 12.6939 3.79407C11.9749 3.05489 11.0946 2.67809 10.0531 2.66368C9.01151 2.64927 8.12114 3.00157 7.38195 3.72058C6.64277 4.43959 6.26597 5.31988 6.25156 6.36144C6.23715 7.40301 6.58945 8.29339 7.30846 9.03257C8.02747 9.77175 8.90776 10.1486 9.94933 10.163ZM9.97008 8.6631C9.34514 8.65446 8.81697 8.42838 8.38556 7.98487C7.95415 7.54136 7.74277 7.00713 7.75142 6.38219C7.76007 5.75725 7.98614 5.22908 8.42965 4.79767C8.87317 4.36627 9.40739 4.15489 10.0323 4.16353C10.6573 4.17218 11.1854 4.39826 11.6168 4.84177C12.0483 5.28528 12.2596 5.81951 12.251 6.44445C12.2423 7.06939 12.0163 7.59756 11.5728 8.02896C11.1292 8.46037 10.595 8.67175 9.97008 8.6631ZM9.91474 12.6627C7.88716 12.6347 6.04794 12.0432 4.3971 10.8883C2.74625 9.73341 1.55902 8.19948 0.835415 6.28651C1.61167 4.39429 2.84087 2.89379 4.52304 1.78501C6.20521 0.67623 8.06008 0.135866 10.0877 0.163918C12.1152 0.191969 13.9545 0.783441 15.6053 1.93833C17.2562 3.09323 18.4434 4.62716 19.167 6.54013C18.3907 8.43235 17.1615 9.93285 15.4794 11.0416C13.7972 12.1504 11.9423 12.6908 9.91474 12.6627Z'
            fill='currentColor'
          />
        </svg>
      </Button>
    </Tooltip>
  ) : (
    <Tooltip content='Unhide'>
      <Button size='sm' variant='light' isIconOnly className='text-divider-300' onPress={() => hideAccount(address)}>
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='17' viewBox='0 0 20 17' fill='none'>
          <path
            d='M16.3549 16.7317L12.9031 13.2253C12.4149 13.3714 11.9238 13.4792 11.4297 13.5487C10.9356 13.6183 10.4247 13.6494 9.897 13.6421C7.79998 13.6131 5.94013 13.0075 4.31744 11.8252C2.69475 10.6429 1.52816 9.12314 0.817675 7.26591C1.1195 6.5339 1.49698 5.85503 1.95012 5.2293C2.40327 4.60356 2.91799 4.04465 3.4943 3.55258L1.23513 1.18777L2.41783 0.037352L17.5376 15.5813L16.3549 16.7317ZM9.93159 11.1424C10.0844 11.1445 10.2268 11.1395 10.3589 11.1274C10.491 11.1154 10.6338 11.0896 10.7871 11.05L6.3498 6.4882C6.30602 6.64038 6.27628 6.78235 6.26056 6.91409C6.24485 7.04583 6.23594 7.18808 6.23382 7.34084C6.21941 8.38241 6.57171 9.27278 7.29072 10.012C8.00973 10.7512 8.89002 11.1279 9.93159 11.1424ZM16.0092 11.6015L13.3999 8.94013C13.5004 8.70538 13.5801 8.46688 13.639 8.22461C13.6979 7.98235 13.7293 7.72234 13.7331 7.44459C13.7475 6.40303 13.3952 5.51265 12.6762 4.77347C11.9572 4.03428 11.0769 3.65749 10.0353 3.64308C9.75759 3.63923 9.49681 3.66341 9.25301 3.71559C9.00921 3.76778 8.7685 3.84779 8.53087 3.95563L6.43547 1.80143C7.00813 1.57322 7.59386 1.40423 8.19265 1.29444C8.79145 1.18466 9.41721 1.13428 10.0699 1.14331C12.1669 1.17233 14.0268 1.77797 15.6495 2.96026C17.2722 4.14254 18.4388 5.6623 19.1493 7.51952C18.8185 8.33447 18.3879 9.089 17.8574 9.78312C17.3269 10.4772 16.7108 11.0834 16.0092 11.6015ZM12.2084 7.71519L9.74321 5.18085C10.133 5.11679 10.4902 5.15298 10.8147 5.28943C11.1393 5.42588 11.4178 5.62072 11.6505 5.87397C11.8831 6.12721 12.0492 6.41773 12.1489 6.74553C12.2485 7.07333 12.2684 7.39655 12.2084 7.71519Z'
            fill='currentColor'
          />
        </svg>
      </Button>
    </Tooltip>
  );
}

function CreateSuccess({ isOpen, onClose, address }: Props) {
  const navigate = useNavigate();
  const { setCurrent } = useAccount();
  const { meta } = useAddressMeta(address);

  const [, , , refetch] = useQueryAccountOmniChain(address);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <Modal size='lg' isOpen={isOpen} hideCloseButton closeButton={false}>
      <ModalContent>
        <ModalBody className='flex flex-col items-center gap-5 py-5 pt-10'>
          <div className='bg-primary flex h-[120px] w-[120px] items-center justify-center rounded-[30px]'>
            <img src='/images/congrats.png' className='w-20' />
          </div>

          <h4 className='text-xl font-extrabold'>Your Account was successfully created!</h4>

          <div className='bg-secondary rounded-medium flex items-center gap-2.5 self-stretch p-2.5'>
            <div className='bg-success h-[8px] w-[8px] rounded-full' />
            <AddressCell className='flex-1' withCopy shorten={false} value={address} />
            <HideIcon address={address} />
          </div>

          {meta.delegatees?.map((delegatee, index) => (
            <div key={index} className='bg-secondary rounded-medium flex items-center gap-2.5 self-stretch p-2.5'>
              <div className='bg-success h-[8px] w-[8px] rounded-full' />
              <AddressCell className='flex-1' withCopy shorten={false} value={delegatee} />
              <HideIcon address={delegatee} />
            </div>
          ))}

          <Button
            fullWidth
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

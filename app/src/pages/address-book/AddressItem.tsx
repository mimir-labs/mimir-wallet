// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconLink from '@/assets/svg/icon-link.svg?react';
import IconQr from '@/assets/svg/icon-qr.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { AddressCell, AddressRow, CopyAddress, EditAddressDialog } from '@/components';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';
import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useQrAddress } from '@/hooks/useQrAddress';
import { useToggle } from '@/hooks/useToggle';
import React from 'react';
import { Link } from 'react-router-dom';

import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip } from '@mimir-wallet/ui';

function Icons({ address }: { address: string }) {
  const [deleteOpen, toggleDeleteOpen] = useToggle();
  const { deleteAddress } = useAccount();
  const { open: openQr } = useQrAddress();
  const { open: openExplorer } = useAddressExplorer();

  return (
    <>
      <Tooltip content='Copy Address'>
        <CopyAddress address={address} color='primary' className='min-h-6 min-w-6 opacity-100' />
      </Tooltip>
      <Tooltip content='QR Code'>
        <Button isIconOnly color='primary' size='sm' variant='light' onClick={() => openQr(address)}>
          <IconQr className='h-4 w-4' />
        </Button>
      </Tooltip>
      <Tooltip content='Open Explorer'>
        <Button isIconOnly color='primary' variant='light' size='sm' onClick={() => openExplorer(address)}>
          <IconLink className='h-4 w-4' />
        </Button>
      </Tooltip>
      <Tooltip content='Delete Address'>
        <Button isIconOnly color='primary' size='sm' variant='light' onClick={toggleDeleteOpen}>
          <IconDelete className='h-4 w-4' />
        </Button>
      </Tooltip>

      <Modal isOpen={deleteOpen} onClose={toggleDeleteOpen}>
        <ModalContent>
          <ModalHeader className='text-danger'>Delete Contact</ModalHeader>
          <Divider />
          <ModalBody>
            <p className='break-all'>
              Are you sure you want to delete <b>{address}</b> from your Address Book?
            </p>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button fullWidth onClick={toggleDeleteOpen} color='danger' variant='ghost'>
              Cancel
            </Button>
            <Button fullWidth onClick={() => deleteAddress(address)} color='danger'>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function AddressItem({ address }: { address: string }) {
  const [open, toggleOpen] = useToggle();
  const { meta } = useAddressMeta(address);
  const upSm = useMediaQuery('sm');
  const upMd = useMediaQuery('md');
  const copyAddress = useCopyAddressToClipboard(address);

  return (
    <>
      {!upSm && (
        <div className='border-secondary bg-content1 shadow-medium rounded-[20px] border-1 p-4 [&_.AddressCell-Address]:!mt-2.5 [&_.AddressCell-Address]:text-sm [&_.AddressCell-Content]:ml-2.5 [&_.AddressCell-Name]:text-lg'>
          <AddressCell iconSize={50} icons={<Icons address={address} />} shorten value={address} withCopy={false} />
          <div className='mt-5 flex gap-2.5'>
            <Button onClick={toggleOpen} variant='ghost' className='ml-16'>
              Edit
            </Button>
            <Button asChild variant='solid'>
              <Link to={`/transfer?to=${address}`}>
                Send
                <IconSend />
              </Link>
            </Button>
          </div>
        </div>
      )}
      {upSm && (
        <div className='bg-content1 shadow-medium relative flex items-center gap-10 rounded-[20px] p-6'>
          <div className='flex flex-[1] items-center gap-2.5'>
            <p className='text-lg font-bold'>{meta?.name}</p>
          </div>
          <div className='flex flex-[3] items-center'>
            <span
              onClick={(e) => {
                e.stopPropagation();
                copyAddress();
              }}
            >
              <AddressRow shorten={!upMd} value={address} withAddress withName={false} />
            </span>
            <div className='w-1' />
            <Icons address={address} />
          </div>
          <div className='flex gap-2.5'>
            <Button onClick={toggleOpen} variant='ghost'>
              Edit
            </Button>
            <Button asChild variant='solid'>
              <Link to={`/transfer?to=${address}`}>
                Send
                <IconSend />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <EditAddressDialog address={address} onClose={toggleOpen} open={open} />
    </>
  );
}

export default React.memo(AddressItem);

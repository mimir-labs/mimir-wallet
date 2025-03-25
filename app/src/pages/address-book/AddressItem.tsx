// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconLink from '@/assets/svg/icon-link.svg?react';
import IconQr from '@/assets/svg/icon-qr.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { AddressCell, AddressRow, CopyButton, EditAddressDialog, QrcodeAddress } from '@/components';
import { useToggle } from '@/hooks/useToggle';
import { useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

import { chainLinks } from '@mimir-wallet/polkadot-core';
import { Button, Divider, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

function Icons({ address }: { address: string }) {
  const [qrOpen, toggleQrOpen] = useToggle();
  const [deleteOpen, toggleDeleteOpen] = useToggle();
  const { deleteAddress } = useAccount();

  return (
    <>
      <QrcodeAddress onClose={toggleQrOpen} open={qrOpen} value={address} />
      <CopyButton color='primary' size='sm' value={address} className='opacity-100' />
      <Button isIconOnly color='primary' size='sm' variant='light' onPress={toggleQrOpen}>
        <IconQr className='w-4 h-4' />
      </Button>
      <Button
        isIconOnly
        color='primary'
        variant='light'
        as={Link}
        href={chainLinks.accountExplorerLink(address)}
        size='sm'
        target='_blank'
      >
        <IconLink className='w-4 h-4' />
      </Button>
      <Button isIconOnly color='primary' size='sm' variant='light' onPress={toggleDeleteOpen}>
        <IconDelete className='w-4 h-4' />
      </Button>

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
            <Button fullWidth onPress={toggleDeleteOpen} color='danger' variant='ghost'>
              Cancel
            </Button>
            <Button fullWidth onPress={() => deleteAddress(address)} color='danger'>
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
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));
  const downMd = useMediaQuery(breakpoints.down('md'));

  return (
    <>
      {downSm && (
        <div className='rounded-large p-4 shadow-medium bg-content1 [&_.AddressCell-Content]:ml-2.5 [&_.AddressCell-Name]:text-large [&_.AddressCell-Address]:!mt-2.5 [&_.AddressCell-Address]:text-small'>
          <AddressCell iconSize={50} icons={<Icons address={address} />} shorten value={address} withCopy={false} />
          <div className='flex gap-2.5 mt-5'>
            <Button onPress={toggleOpen} variant='ghost' className='ml-16'>
              Edit
            </Button>
            <Button as={Link} variant='solid' endContent={<IconSend />} href={`/transfer?to=${address}`}>
              Send
            </Button>
          </div>
        </div>
      )}
      {!downSm && (
        <div className='relative flex items-center gap-10 rounded-large p-6 bg-content1 shadow-medium'>
          <div className='flex-[1] flex items-center gap-2.5'>
            <p className='text-large font-bold'>{meta?.name}</p>
          </div>
          <div className='flex-[3] flex items-center'>
            <AddressRow shorten={downMd} value={address} withAddress withName={false} />
            <Icons address={address} />
          </div>
          <div className='flex gap-2.5'>
            <Button onPress={toggleOpen} variant='ghost'>
              Edit
            </Button>
            <Button as={Link} variant='solid' endContent={<IconSend />} href={`/transfer?to=${address}`}>
              Send
            </Button>
          </div>
        </div>
      )}

      <EditAddressDialog address={address} onClose={toggleOpen} open={open} />
    </>
  );
}

export default React.memo(AddressItem);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { decodeAddress, encodeAddress } from '@/api';
import { useApi } from '@/hooks/useApi';
import { useDeriveAccountInfo } from '@/hooks/useDeriveAccountInfo';
import { addressEq } from '@/utils';
import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useMemo, useState } from 'react';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

import Input from './Input';
import { toastError } from './utils';

function Content({
  defaultAddress,
  watchlist,
  onAdded,
  onClose
}: {
  defaultAddress?: string;
  watchlist?: boolean;
  onAdded?: (address: string) => void;
  onClose?: () => void;
}) {
  const { addAddress, addresses } = useAccount();
  const { network } = useApi();
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string | undefined>(defaultAddress || '');
  const [info] = useDeriveAccountInfo(address);
  const { display, displayParent } = info || {};

  const _onChangeAddress = useCallback((addressInput: string) => {
    let address = '';

    try {
      const publicKey = decodeAddress(addressInput);

      address = encodeAddress(publicKey);
      setAddress(address);
    } catch {
      setAddress(addressInput);
    }
  }, []);

  const exists = useMemo(
    () =>
      address &&
      isAddress(address) &&
      addresses.findIndex((item) => item.watchlist === watchlist && addressEq(item.address, address)) > -1,
    [address, addresses, watchlist]
  );

  const _onCommit = useCallback((): void => {
    try {
      if (!address) return;

      if (!isAddress(address)) {
        throw new Error('not a valid address');
      }

      addAddress(address, display ? display : name.trim(), [network], watchlist);
      onAdded?.(address);
      onClose?.();
    } catch (error) {
      toastError(error);
    }
  }, [address, addAddress, display, name, network, watchlist, onAdded, onClose]);

  return (
    <>
      <ModalBody>
        <div className='space-y-5'>
          {display ? (
            <Input
              label='Identity'
              disabled
              value={`${displayParent || display}${displayParent ? `/${display}` : ''}`}
            />
          ) : (
            <Input label='Name' onChange={setName} placeholder='input name for contact' value={name} />
          )}
          <Input
            error={exists ? new Error('Already in related account') : null}
            label='Address'
            onChange={_onChangeAddress}
            placeholder='input address'
            value={address}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color='primary' fullWidth onPress={onClose} variant='ghost'>
          Cancel
        </Button>
        <Button
          color='primary'
          isDisabled={!(name || display) || !address}
          fullWidth
          onPress={_onCommit}
          variant='solid'
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
}

function AddAddressDialog({
  defaultAddress,
  watchlist,
  onAdded,
  onClose,
  open
}: {
  defaultAddress?: string;
  watchlist?: boolean;
  open: boolean;
  onAdded?: (address: string) => void;
  onClose?: () => void;
}) {
  return (
    <Modal size='lg' onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalHeader className='justify-center'>{watchlist ? 'Add Watchlist' : 'Add New Contact'}</ModalHeader>
        <Content defaultAddress={defaultAddress} watchlist={watchlist} onAdded={onAdded} onClose={onClose} />
      </ModalContent>
    </Modal>
  );
}

export default React.memo(AddAddressDialog);

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useDeriveAccountInfo } from '@/hooks/useDeriveAccountInfo';
import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { addressEq, decodeAddress, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
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
  const { chainSS58 } = useApi();
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string | undefined>(defaultAddress || '');
  const [info] = useDeriveAccountInfo(address);
  const { display, displayParent } = info || {};

  useLayoutEffect(() => {
    if (display) {
      setName(`${displayParent || display}${displayParent ? `/${display}` : ''}`);
    }
  }, [display, displayParent]);

  const _onChangeAddress = useCallback(
    (addressInput: string) => {
      let address = '';

      try {
        const publicKey = decodeAddress(addressInput);

        address = encodeAddress(publicKey, chainSS58);
        setAddress(address);
      } catch {
        setAddress(addressInput);
      }
    },
    [chainSS58]
  );

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

      addAddress(address, display ? display : name.trim(), watchlist);
      onAdded?.(address);
      onClose?.();
    } catch (error) {
      toastError(error);
    }
  }, [address, addAddress, display, name, watchlist, onAdded, onClose]);

  return (
    <>
      <ModalBody>
        <div className='space-y-5'>
          <Input
            label='Name'
            disabled={!!display}
            onChange={setName}
            placeholder='input name for contact'
            value={name}
          />
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

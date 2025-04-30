// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useAccount } from '@/accounts/useAccount';
import { useSelectedAccountCallback } from '@/accounts/useSelectedAccount';
import { toastError } from '@/components/utils';
import { utm } from '@/config';
import { DETECTED_ACCOUNT_KEY } from '@/constants';
import { useToggle } from '@/hooks/useToggle';
import { u8aToHex } from '@polkadot/util';
import { createKeyMulti } from '@polkadot/util-crypto';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addressToHex, encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { service, store } from '@mimir-wallet/service';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

interface Props {
  name?: string;
  signatories: string[];
  threshold: number;
  checkField: () => boolean;
}

async function createMultisig(
  network: string,
  signatories: string[],
  threshold: number,
  name: string
): Promise<Uint8Array> {
  const address = createKeyMulti(signatories, threshold);

  await service.createMultisig(
    network,
    signatories.map((value) => addressToHex(value)),
    threshold,
    name
  );

  store.set(
    DETECTED_ACCOUNT_KEY,
    Array.from(new Set([...((store.get(DETECTED_ACCOUNT_KEY) as HexString[]) || []), u8aToHex(address)]))
  );

  return address;
}

function CreateStatic({ checkField, name, signatories, threshold }: Props) {
  const [open, toggleOpen] = useToggle();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const selectAccount = useSelectedAccountCallback();
  const { addAddress, resync } = useAccount();
  const { network, chainSS58 } = useApi();
  const { mode } = useNetworks();

  const handleCreate = useCallback(async () => {
    if (!(name && checkField())) return;

    try {
      setIsLoading(true);

      const address = await createMultisig(network, signatories, threshold, name);

      await resync(mode === 'omni', network, chainSS58);

      utm && (await service.utm(network, u8aToHex(address), utm));

      const encodedAddress = encodeAddress(address, chainSS58);

      selectAccount(encodedAddress);
      addAddress(encodedAddress, name);

      navigate('/');
    } catch (error) {
      toastError(error);
    }

    setIsLoading(false);
  }, [name, checkField, network, signatories, threshold, resync, mode, chainSS58, selectAccount, addAddress, navigate]);

  return (
    <>
      <Modal onClose={toggleOpen} isOpen={open} size='xl'>
        <ModalContent className='w-auto'>
          <ModalHeader>Create Static Multisig</ModalHeader>
          <ModalBody>
            <ul>
              <li>You're creating a non-Flexible multisig, members and threshold can't be modified.</li>
              <li>You need to submit signature to confirm your identity; this isn't a transaction.</li>
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button fullWidth onPress={toggleOpen} variant='ghost'>
              Cancel
            </Button>
            <Button fullWidth isLoading={isLoading} onPress={handleCreate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        isDisabled={!name}
        fullWidth
        onPress={() => {
          if (!(name && checkField())) return;

          toggleOpen();
        }}
      >
        Create
      </Button>
    </>
  );
}

export default React.memo(CreateStatic);

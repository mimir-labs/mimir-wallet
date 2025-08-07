// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { toastError } from '@/components/utils';
import { utm } from '@/config';
import { u8aToHex } from '@polkadot/util';
import { createKeyMulti } from '@polkadot/util-crypto';
import React, { useState } from 'react';

import { addressToHex, encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import { Button, buttonSpinner, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@mimir-wallet/ui';

interface Props {
  name: string;
  signatories: string[];
  threshold: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (address: string) => void;
}

async function createMultisig(
  network: string,
  signatories: string[],
  threshold: number,
  name: string
): Promise<Uint8Array> {
  const address = createKeyMulti(signatories, threshold);

  await service.multisig.createMultisig(
    network,
    signatories.map((value) => addressToHex(value)),
    threshold,
    name
  );

  return address;
}

function CreateStaticModal({ name, signatories, threshold, isOpen, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { resync } = useAccount();
  const { network, chainSS58 } = useApi();
  const { mode } = useNetworks();

  const handleCreate = async () => {
    if (!name) return;

    try {
      setIsLoading(true);

      const address = await createMultisig(network, signatories, threshold, name);

      utm && (await service.account.utm(network, u8aToHex(address), utm));

      await resync(mode === 'omni', network, chainSS58);

      const encodedAddress = encodeAddress(address, chainSS58);

      onSuccess(encodedAddress);
    } catch (error) {
      toastError(error);
    }

    setIsLoading(false);
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} size='xl'>
      <ModalContent className='w-auto'>
        <ModalHeader>Create Static Multisig</ModalHeader>
        <ModalBody>
          <ul>
            <li>You're creating a non-Flexible multisig, members and threshold can't be modified.</li>
            <li>You need to submit signature to confirm your identity; this isn't a transaction.</li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button fullWidth onClick={onClose} variant='ghost'>
            Cancel
          </Button>
          <Button fullWidth onClick={handleCreate}>
            {isLoading ? buttonSpinner : null}
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(CreateStaticModal);

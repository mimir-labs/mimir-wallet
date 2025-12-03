// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from '../types';

import { encodeAddress, useNetwork } from '@mimir-wallet/polkadot-core';
import { Button, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';
import { useToggle } from 'react-use';

import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { AddressRow } from '@/components';
import { useCacheMultisig } from '@/hooks/useCacheMultisig';

function Prepare({ onSelect }: { onSelect: (data: PrepareFlexible) => void }) {
  const { chain, network } = useNetwork();

  // prepare multisigs
  const [prepares] = useCacheMultisig(network);
  // flexible
  const [open, toggleOpen] = useToggle(false);

  return (
    <>
      {prepares.length > 0 && (
        <Button color='primary' onClick={toggleOpen} variant='light'>
          <IconInfo />
          {prepares.length} unfinished creation
        </Button>
      )}

      <Modal onClose={toggleOpen} hideCloseButton isOpen={open}>
        <ModalContent>
          <ModalBody className='gap-4'>
            {prepares.map((item, index) => (
              <Button
                color='secondary'
                key={index}
                onClick={() => {
                  if (item.pure) {
                    onSelect({
                      creator: item.creator,
                      who: item.who.map((address) => encodeAddress(address, chain.ss58Format)),
                      threshold: item.threshold,
                      name: item.name,
                      multisigName: item.multisigName,
                      pure: item.pure ? encodeAddress(item.pure, chain.ss58Format) : null,
                      blockNumber: item.blockNumber,
                      extrinsicIndex: item.extrinsicIndex
                    });
                    toggleOpen();
                  }
                }}
                className='text-foreground flex items-center justify-between'
              >
                <AddressRow defaultName={item.name} withAddress withName value={item.pure} />
              </Button>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Prepare;

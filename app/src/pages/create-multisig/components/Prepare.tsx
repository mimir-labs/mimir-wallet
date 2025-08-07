// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PrepareFlexible } from '../types';

import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { AddressRow } from '@/components';
import { useCacheMultisig } from '@/hooks/useCacheMultisig';
import { useToggle } from 'react-use';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

function Prepare({ onSelect }: { onSelect: (data: PrepareFlexible) => void }) {
  const { chainSS58 } = useApi();

  // prepare multisigs
  const [prepares] = useCacheMultisig();
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
                      who: item.who.map((address) => encodeAddress(address, chainSS58)),
                      threshold: item.threshold,
                      name: item.name,
                      multisigName: item.multisigName,
                      pure: item.pure ? encodeAddress(item.pure, chainSS58) : null,
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

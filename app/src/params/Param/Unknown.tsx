// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamProps } from './types';

import { Bytes } from '@/components';
import JsonView from '@/components/JsonView';
import { isHex, isString } from '@polkadot/util';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

function Unknown({ name, value }: ParamProps) {
  const [open, toggleOpen] = useToggle(false);

  const human = useMemo(() => {
    return value.toHuman();
  }, [value]);

  if (isHex(human)) {
    return <Bytes value={human} />;
  }

  if (isString(human)) {
    return human.toString().slice(0, 32);
  }

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <span className='text-primary text-tiny cursor-pointer font-bold' onClick={toggleOpen}>
        View {name || 'Details'}
      </span>

      <Modal size='xl' isOpen={open} onClose={toggleOpen} scrollBehavior='inside'>
        <ModalContent>
          <ModalBody className='px-5 py-5'>
            <JsonView data={human} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </span>
  );
}

export default React.memo(Unknown);

// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamProps } from './types';

import { Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';
import { isHex, isString } from '@polkadot/util';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { Bytes } from '@/components';
import JsonView from '@/components/JsonView';

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
      <span
        className="text-primary cursor-pointer text-xs font-bold"
        onClick={toggleOpen}
      >
        View {name || 'Details'}
      </span>

      <Modal size="xl" isOpen={open} onClose={toggleOpen}>
        <ModalContent>
          <ModalBody>
            <JsonView data={human} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </span>
  );
}

export default React.memo(Unknown);

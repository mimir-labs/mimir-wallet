// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { Divider, Modal, ModalBody, ModalContent, ModalHeader } from '@mimir-wallet/ui';

import Call from '../Call';

function CallDialog({ action, value, onClose }: { action: string; value: IMethod; onClose: () => void }) {
  return (
    <Modal size='lg' isOpen onClose={onClose}>
      <ModalContent>
        <ModalHeader>{action}</ModalHeader>
        <ModalBody className='gap-4'>
          <Divider />
          <Call call={value} registry={value.registry} showFallback />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function CallName({ value }: { value: IMethod }) {
  const [isOpen, toggleOpen] = useToggle(false);
  const action = useMemo(() => {
    try {
      const { method, section } = value.registry.findMetaCall(value.callIndex);

      if (section && method) {
        return `${section}.${method}`;
      }

      return null;
    } catch {
      return null;
    }
  }, [value.callIndex, value.registry]);

  if (action) {
    return (
      <>
        <button onClick={toggleOpen}>{action}</button>

        {isOpen && <CallDialog action={action} value={value} onClose={() => toggleOpen(false)} />}
      </>
    );
  }

  return 'Unknown';
}

export default React.memo(CallName);

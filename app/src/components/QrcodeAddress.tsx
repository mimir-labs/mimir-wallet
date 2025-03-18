// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import qrcode from 'qrcode-generator';
import React, { useEffect, useRef } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

import CopyButton from './CopyButton';

interface Props {
  open: boolean;
  onClose?: () => void;
  value: AccountId | AccountIndex | Address | string | Uint8Array | null | undefined;
}

function Content({ value }: { value: string }) {
  const { chain } = useApi();
  const qr = useRef(qrcode(0, 'M'));
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      qr.current = qrcode(0, 'M');

      qr.current.addData(value);
      qr.current.make();

      if (container.current) container.current.innerHTML = qr.current.createImgTag(7);
    }, 100);
  }, [value]);

  return (
    <div>
      <div className='relative'>
        <div className='flex items-center justify-center my-0 mx-auto w-[300px] h-[300px]' ref={container} />
        <Avatar
          className='absolute left-0 right-0 top-0 bottom-0 m-auto bg-transparent'
          src={chain.icon}
          style={{ width: 50, height: 50 }}
        />
      </div>
      <p className='mt-2.5 break-all text-center'>
        {value}
        <CopyButton value={value} />
      </p>
    </div>
  );
}

function QrcodeAddress({ onClose, open, value }: Props) {
  return (
    <Modal hideCloseButton onClose={onClose} isOpen={open}>
      <ModalContent>
        <ModalBody className='py-5'>
          <Content value={value?.toString() || ''} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(QrcodeAddress);

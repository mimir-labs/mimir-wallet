// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import qrcode from 'qrcode-generator';
import React, { useEffect, useRef } from 'react';

import { encodeAddress, SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

import CopyButton from './CopyButton';
import InputNetwork from './InputNetwork';

interface Props {
  open: boolean;
  onClose?: () => void;
  value: AccountId | AccountIndex | Address | string | Uint8Array | null | undefined;
}

function Content({ value }: { value: string }) {
  const { chain } = useApi();
  const qr = useRef(qrcode(0, 'M'));
  const container = useRef<HTMLDivElement>(null);

  const ss58FormatValue = encodeAddress(value, chain.ss58Format);

  useEffect(() => {
    setTimeout(() => {
      qr.current = qrcode(0, 'M');

      qr.current.addData(ss58FormatValue);
      qr.current.make();

      if (container.current) container.current.innerHTML = qr.current.createImgTag(7);
    }, 100);
  }, [ss58FormatValue]);

  return (
    <div>
      <InputNetwork />
      <div className='relative'>
        <div className='flex items-center justify-center my-0 mx-auto w-[300px] h-[300px]' ref={container} />
        <Avatar
          className='absolute left-0 right-0 top-0 bottom-0 m-auto bg-transparent'
          src={chain.icon}
          style={{ width: 50, height: 50 }}
        />
      </div>
      <p className='mt-2.5 break-all text-center'>
        {ss58FormatValue}
        <CopyButton value={ss58FormatValue} />
      </p>
    </div>
  );
}

function QrcodeAddress({ onClose, open, value }: Props) {
  return (
    <Modal hideCloseButton onClose={onClose} isOpen={open} size='sm'>
      <ModalContent>
        <ModalBody className='py-5'>
          <SubApiRoot>
            <Content value={value?.toString() || ''} />
          </SubApiRoot>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(QrcodeAddress);

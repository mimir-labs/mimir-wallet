// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CopyButton, InputNetwork } from '@/components';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useQrAddress } from '@/hooks/useQrAddress';
import qrcode from 'qrcode-generator';
import React, { useEffect, useRef } from 'react';

import { encodeAddress, SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Modal, ModalBody, ModalContent } from '@mimir-wallet/ui';

function Content({
  value,
  network,
  setNetwork
}: {
  value: string;
  network: string;
  setNetwork: (network: string) => void;
}) {
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
      <InputNetwork network={network} setNetwork={setNetwork} />
      <div className='relative'>
        <div className='mx-auto my-0 flex h-[300px] w-[300px] items-center justify-center' ref={container} />
        <Avatar
          className='bg-content1 absolute top-0 right-0 bottom-0 left-0 m-auto'
          src={chain.icon}
          style={{ width: 50, height: 50 }}
        />
      </div>

      <p className='mt-2.5 text-center break-all'>
        {ss58FormatValue}
        <CopyButton value={ss58FormatValue} />
      </p>
    </div>
  );
}

function QrcodeAddressModal() {
  const [network, setNetwork] = useInputNetwork();
  const { isOpen, close, address } = useQrAddress();

  if (!address) {
    return null;
  }

  return (
    <Modal hideCloseButton onClose={close} isOpen={isOpen} size='sm'>
      <ModalContent>
        <ModalBody className='py-5'>
          <SubApiRoot network={network}>
            <Content value={address} network={network} setNetwork={setNetwork} />
          </SubApiRoot>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(QrcodeAddressModal);

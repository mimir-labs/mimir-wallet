// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  encodeAddress,
  NetworkProvider,
  useNetwork,
} from '@mimir-wallet/polkadot-core';
import {
  Avatar,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  VisuallyHidden,
} from '@mimir-wallet/ui';
import React, { useEffect, useRef } from 'react';

import { CopyButton, InputNetwork } from '@/components';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useQrAddress } from '@/hooks/useQrAddress';

function Content({
  value,
  network,
  setNetwork,
}: {
  value: string;
  network: string;
  setNetwork: (network: string) => void;
}) {
  const { chain } = useNetwork();
  const container = useRef<HTMLDivElement>(null);

  const ss58FormatValue = encodeAddress(value, chain.ss58Format);

  useEffect(() => {
    // Dynamic import qrcode-generator to avoid loading on page init
    import('qrcode-generator').then(({ default: qrcode }) => {
      const qr = qrcode(0, 'M');

      qr.addData(ss58FormatValue);
      qr.make();

      if (container.current) container.current.innerHTML = qr.createImgTag(7);
    });
  }, [ss58FormatValue]);

  return (
    <div>
      <InputNetwork network={network} setNetwork={setNetwork} />
      <div className="relative">
        <div
          className="mx-auto my-0 flex h-[300px] w-[300px] items-center justify-center"
          ref={container}
        />
        <Avatar
          className="bg-background absolute top-0 right-0 bottom-0 left-0 m-auto"
          src={chain.icon}
          style={{ width: 50, height: 50 }}
        />
      </div>

      <p className="mt-2.5 text-center break-all">
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
    <Modal hideCloseButton onClose={close} isOpen={isOpen} size="sm">
      <ModalContent>
        <VisuallyHidden>
          <ModalHeader>QR Code</ModalHeader>
        </VisuallyHidden>
        <ModalBody>
          <NetworkProvider network={network}>
            <Content
              value={address}
              network={network}
              setNetwork={setNetwork}
            />
          </NetworkProvider>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(QrcodeAddressModal);

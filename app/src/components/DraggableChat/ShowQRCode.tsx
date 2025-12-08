// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@mimir-wallet/ui';

import IconQr from '@/assets/svg/icon-qr.svg?react';
import { useQrAddress } from '@/hooks/useQrAddress';

interface ShowQRCodeProps {
  eventId: string;
  address: string;
}

function ShowQRCode({ address }: ShowQRCodeProps) {
  const qrAddress = useQrAddress();

  const handleShowQR = () => {
    const targetAddress = address;

    if (targetAddress) {
      qrAddress.open(targetAddress);
    }
  };

  return (
    <div
      onClick={handleShowQR}
      className="border-divider hover:border-primary focus-visible:border-primary focus-visible:ring-primary/30 flex w-full cursor-pointer items-center justify-between rounded-[10px] border bg-white p-[10px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      {/* Left side: Icon and title */}
      <div className="flex items-center gap-2.5">
        <IconQr className="h-[30px] w-[30px]" />
        <div className="text-foreground text-[14px] font-bold">
          Generate QR Code
        </div>
      </div>

      {/* Right side: View button */}
      <Button size="sm" color="secondary" continuePropagation>
        View
      </Button>
    </div>
  );
}

export default ShowQRCode;

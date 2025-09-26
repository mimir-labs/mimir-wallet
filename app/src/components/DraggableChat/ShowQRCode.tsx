// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconQr from '@/assets/svg/icon-qr.svg?react';
import { useQrAddress } from '@/hooks/useQrAddress';

import { Button } from '@mimir-wallet/ui';

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
    <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border bg-white p-[10px]'>
      {/* Left side: Icon and title */}
      <div className='flex items-center gap-2.5'>
        <IconQr className='h-[30px] w-[30px]' />
        <div className='text-foreground text-[14px] font-bold'>Generate QR Code</div>
      </div>

      {/* Right side: View button */}
      <Button size='sm' color='secondary' onClick={handleShowQR}>
        View
      </Button>
    </div>
  );
}

export default ShowQRCode;

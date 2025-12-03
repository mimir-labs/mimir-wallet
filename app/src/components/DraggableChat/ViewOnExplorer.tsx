// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@mimir-wallet/ui';
import { isAddress } from '@polkadot/util-crypto';

import IconGlobal from '@/assets/svg/icon-global.svg?react';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';

interface ViewOnExplorerProps {
  eventId: string;
  address: string;
}

function ViewOnExplorer({ eventId: _eventId, address }: ViewOnExplorerProps) {
  const addressExplorer = useAddressExplorer();
  const isValidAddress = isAddress(address);

  const handleViewOnExplorer = () => {
    if (isValidAddress) {
      addressExplorer.open(address);
    }
  };

  return (
    <div
      onClick={isValidAddress ? handleViewOnExplorer : undefined}
      className={`border-divider-300 flex w-full items-center justify-between rounded-[10px] border bg-white p-[10px] ${
        isValidAddress
          ? 'hover:border-primary focus-visible:border-primary focus-visible:ring-primary/30 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:outline-none'
          : 'cursor-not-allowed opacity-60'
      }`}
    >
      {/* Left side: Icon and title */}
      <div className='flex items-center gap-2.5'>
        <IconGlobal className='h-[30px] w-[30px]' />
        <div className='text-foreground text-[14px] font-bold'>Blockchain Explorer</div>
      </div>

      {/* Right side: View button */}
      <Button size='sm' color='secondary' disabled={!isValidAddress} continuePropagation>
        View
      </Button>
    </div>
  );
}

export default ViewOnExplorer;

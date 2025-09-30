// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconGlobal from '@/assets/svg/icon-global.svg?react';
import { useAddressExplorer } from '@/hooks/useAddressExplorer';
import { isAddress } from '@polkadot/util-crypto';

import { Button } from '@mimir-wallet/ui';

interface ViewOnExplorerProps {
  eventId: string;
  address: string;
}

function ViewOnExplorer({ eventId, address }: ViewOnExplorerProps) {
  const addressExplorer = useAddressExplorer();
  const isValidAddress = isAddress(address);

  const handleViewOnExplorer = () => {
    if (isValidAddress) {
      addressExplorer.open(address);
    }
  };

  return (
    <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border bg-white p-[10px]'>
      {/* Left side: Icon and title */}
      <div className='flex items-center gap-2.5'>
        <IconGlobal className='h-[30px] w-[30px]' />
        <div className='text-foreground text-[14px] font-bold'>Blockchain Explorer</div>
      </div>

      {/* Right side: View button */}
      <Button size='sm' color='secondary' disabled={!isValidAddress} onClick={handleViewOnExplorer}>
        View
      </Button>
    </div>
  );
}

export default ViewOnExplorer;

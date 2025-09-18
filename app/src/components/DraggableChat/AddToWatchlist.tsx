// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';

import { Button } from '@mimir-wallet/ui';

interface AddToWatchlistProps {
  eventId: string;
  address?: string;
}

function AddToWatchlist({ address }: AddToWatchlistProps) {
  const { addAddressBook } = useAccount();

  const handleAddToWatchlist = () => {
    addAddressBook(address, true);
  };

  return (
    <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border bg-white p-[10px]'>
      {/* Left side: Icon and title */}
      <div className='flex items-center gap-2.5'>
        <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
          <circle cx='15' cy='15' r='15' fill='url(#paint0_linear_24181_72916)' />
          <path
            d='M15.375 7.75C16.2172 7.75 16.9004 8.43316 16.9004 9.27539V13.8496H21.4746C22.3168 13.8496 23 14.5328 23 15.375C23 16.2172 22.3168 16.9004 21.4746 16.9004H16.9004V21.4746C16.9004 22.3168 16.2172 23 15.375 23C14.5328 23 13.8496 22.3168 13.8496 21.4746V16.9004H9.27539C8.43316 16.9004 7.75 16.2172 7.75 15.375C7.75 14.5328 8.43316 13.8496 9.27539 13.8496H13.8496V9.27539C13.8496 8.43316 14.5328 7.75 15.375 7.75Z'
            fill='white'
          />
          <defs>
            <linearGradient
              id='paint0_linear_24181_72916'
              x1='0'
              y1='15'
              x2='30'
              y2='15'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='#2700FF' />
              <stop offset='1' stopColor='#0094FF' />
            </linearGradient>
          </defs>
        </svg>
        <div className='text-foreground text-[14px] font-bold'>Add New Contact</div>
      </div>

      {/* Right side: Add button */}
      <Button size='sm' color='secondary' onClick={handleAddToWatchlist}>
        Add
      </Button>
    </div>
  );
}

export default AddToWatchlist;

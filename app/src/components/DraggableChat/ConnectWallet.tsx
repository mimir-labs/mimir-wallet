// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWallet } from '@/wallet/useWallet';

import { Button } from '@mimir-wallet/ui';

interface ConnectWalletProps {
  eventId: string;
}

function ConnectWallet({ eventId }: ConnectWalletProps) {
  const { openWallet } = useWallet();

  const handleConnectWallet = () => {
    openWallet();
  };

  return (
    <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border bg-white p-[10px]'>
      {/* Left side: Icon and title */}
      <div className='flex items-center gap-2.5'>
        <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
          <circle cx='15' cy='15' r='15' fill='url(#paint0_linear_24181_72926)' />
          <path
            d='M20.6 8V10.8L20.6361 10.8005C21.3926 10.8196 22 11.4389 22 12.2V15H18.5C17.7268 15 17.1 15.6268 17.1 16.4C17.1 17.1732 17.7268 17.8 18.5 17.8H22V19.4354C22 20.8518 20.8518 22 19.4354 22H10.5646C9.14821 22 8 20.8518 8 19.4354V10.1C8 8.9402 8.9402 8 10.1 8H20.6ZM18.5743 15.947C18.8158 15.8076 19.1134 15.8076 19.3549 15.947C19.5964 16.0865 19.7451 16.3442 19.7451 16.623C19.7451 16.9019 19.5964 17.1595 19.3549 17.299C19.1134 17.4384 18.8158 17.4384 18.5743 17.299C18.3328 17.1595 18.1841 16.9019 18.1841 16.623C18.1841 16.3442 18.3328 16.0865 18.5743 15.947ZM19.2 9.4H10.1C9.7134 9.4 9.4 9.7134 9.4 10.1C9.4 10.4866 9.7134 10.8 10.1 10.8H19.2V9.4Z'
            fill='white'
          />
          <defs>
            <linearGradient
              id='paint0_linear_24181_72926'
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
        <div className='text-foreground text-[14px] font-bold'>Connected Wallets</div>
      </div>

      {/* Right side: View button */}
      <Button size='sm' color='secondary' onClick={handleConnectWallet}>
        View
      </Button>
    </div>
  );
}

export default ConnectWallet;

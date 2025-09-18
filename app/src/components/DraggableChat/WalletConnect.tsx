// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { events } from '@/events';

import { Button } from '@mimir-wallet/ui';

interface WalletConnectProps {
  eventId: string;
}

function WalletConnect({ eventId }: WalletConnectProps) {
  const handleWalletConnect = () => {
    events.emit('walletconnect');
  };

  return (
    <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border bg-white p-[10px]'>
      {/* Left side: Icon and title */}
      <div className='flex items-center gap-2.5'>
        <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
          <circle cx='15' cy='15' r='15' fill='url(#paint0_linear_24181_72919)' />
          <path
            d='M9.89115 11.3442C12.9884 8.2186 18.0116 8.2186 21.1088 11.3442L21.4813 11.7179C21.6381 11.8744 21.6381 12.1269 21.4813 12.2834L20.2071 13.571C20.1287 13.6467 20.0062 13.6467 19.9278 13.571L19.4132 13.0509C17.252 10.8696 13.748 10.8696 11.5868 13.0509L11.0379 13.6064C10.9595 13.6821 10.837 13.6821 10.7586 13.6064L9.47949 12.3238C9.32267 12.1673 9.32267 11.9148 9.47949 11.7583L9.89115 11.3442ZM23.7454 14.0053L24.8824 15.1515C25.0392 15.308 25.0392 15.5605 24.8824 15.717L19.7612 20.8826C19.6043 21.0391 19.3544 21.0391 19.2025 20.8826L15.5711 17.2167C15.5319 17.1763 15.4681 17.1763 15.4289 17.2167L11.7975 20.8826C11.6407 21.0391 11.3908 21.0391 11.2388 20.8826L6.11762 15.717C5.96079 15.5605 5.96079 15.308 6.11762 15.1515L7.25458 14.0053C7.4114 13.8487 7.66134 13.8487 7.81326 14.0053L11.4447 17.6712C11.4839 17.7115 11.5476 17.7115 11.5868 17.6712L15.2182 14.0053C15.375 13.8487 15.625 13.8487 15.7769 14.0053L19.4083 17.6712C19.4475 17.7115 19.5112 17.7115 19.5504 17.6712L23.1818 14.0053C23.3387 13.8487 23.5886 13.8487 23.7454 14.0053Z'
            fill='white'
          />
          <defs>
            <linearGradient
              id='paint0_linear_24181_72919'
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
        <div className='text-foreground text-[14px] font-bold'>Wallet Connect</div>
      </div>

      {/* Right side: Connect button */}
      <Button size='sm' color='secondary' onClick={handleWalletConnect}>
        Connect
      </Button>
    </div>
  );
}

export default WalletConnect;

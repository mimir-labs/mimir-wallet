// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useToggle } from 'react-use';

import { Button } from '@mimir-wallet/ui';

import Fund from '../Fund';

interface GetFundProps {
  eventId: string;
}

function GetFund({ eventId }: GetFundProps) {
  const [open, toggleOpen] = useToggle(false);
  const { current } = useAccount();

  return (
    <>
      <div className='border-divider-300 flex w-full items-center justify-between rounded-[10px] border bg-white p-[10px]'>
        {/* Left side: Icon and title */}
        <div className='flex items-center gap-2.5'>
          <svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30' fill='none'>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30C23.2843 30 30 23.2843 30 15ZM14.5638 7.58348C15.2252 6.92099 15.2252 5.84687 14.5638 5.18437C13.9024 4.52188 12.83 4.52188 12.1686 5.18437L6.86251 10.4991L11.1968 15.9258C11.7811 16.6574 12.847 16.776 13.5774 16.1908C14.3078 15.6055 14.4262 14.5379 13.8419 13.8063L12.6559 12.3214H17.6003C19.4711 12.3214 20.9877 13.8405 20.9877 15.7143C20.9877 17.5881 19.4711 19.1071 17.6003 19.1071H9.13201C8.19663 19.1071 7.43835 19.8667 7.43835 20.8036C7.43835 21.7405 8.19663 22.5 9.13201 22.5H17.6003C21.3419 22.5 24.375 19.4619 24.375 15.7143C24.375 11.9666 21.3419 8.92857 17.6003 8.92857H13.2209L14.5638 7.58348Z'
              fill='url(#paint0_linear_24181_72918)'
            />
            <defs>
              <linearGradient
                id='paint0_linear_24181_72918'
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
          <div className='text-foreground text-[14px] font-bold'>Fund</div>
        </div>

        {/* Right side: View button */}
        <Button size='sm' color='secondary' onClick={toggleOpen}>
          Fund
        </Button>
      </div>

      <Fund onClose={toggleOpen} open={open} receipt={current} />
    </>
  );
}

export default GetFund;

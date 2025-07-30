// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import EmptyAccount from '@/assets/images/empty-account.svg';
import EmptyFavoriteDapp from '@/assets/images/empty-favorite-dapp.svg';
import EmptyPendingTransactions from '@/assets/images/empty-pending-transactions.svg';
import EmptySelectAccount from '@/assets/images/empty-select-account.svg';
import NullImg from '@/assets/images/Null.png';

import { Button, Link } from '@mimir-wallet/ui';

interface Props {
  label?: string;
  height: number | string;
  className?: string;
  variant?: 'account' | 'select-account' | 'default' | 'favorite-dapps' | 'pending-transaction';
}

function Empty({ height, label, variant = 'default', className = '' }: Props) {
  const cn = `flex flex-col items-center justify-center ${variant === 'favorite-dapps' || variant === 'pending-transaction' ? 'gap-[15px]' : 'gap-2.5'} text-small ${variant === 'account' || variant === 'select-account' ? 'text-[#949494]' : 'text-foreground'}`;

  const getContent = () => {
    switch (variant) {
      case 'favorite-dapps':
        return (
          <>
            <img src={EmptyFavoriteDapp} />
            <div className='text-center'>
              <h6>You haven't favorited any apps yet.</h6>
              <p className='text-foreground/50 text-sm'>You can go to the App page to add them to your favorites.</p>
            </div>
            <Button as={Link} size='sm' href='/dapp' color='primary' variant='bordered' radius='full'>
              Go To Apps
            </Button>
          </>
        );
      case 'pending-transaction':
        return (
          <>
            <img src={EmptyPendingTransactions} />
            <p className='text-medium'>No Pending Transaction</p>
          </>
        );
      default:
        return (
          <>
            <img
              alt='null'
              src={variant === 'account' ? EmptyAccount : variant === 'select-account' ? EmptySelectAccount : NullImg}
              width={variant === 'account' ? 52 : variant === 'select-account' ? 55 : 100}
            />
            <span>
              {label ||
                (variant === 'account'
                  ? 'No account found'
                  : variant === 'select-account'
                    ? 'Please select at least 1 account.'
                    : 'No data here.')}
            </span>
          </>
        );
    }
  };

  return (
    <div className={`${cn} ${className}`} style={{ height }}>
      {getContent()}
    </div>
  );
}

export default Empty;

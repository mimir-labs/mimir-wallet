// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import EmptyAccount from '@/assets/images/empty-account.svg';
import EmptySelectAccount from '@/assets/images/empty-select-account.svg';
import NullImg from '@/assets/images/Null.png';

interface Props {
  label?: string;
  height: number | string;
  className?: string;
  variant?: 'account' | 'select-account' | 'default';
}

function Empty({ height, label, variant = 'default', className = '' }: Props) {
  const cn = `flex flex-col items-center justify-center gap-2.5 text-small ${variant === 'account' ? 'text-[#949494]' : variant === 'select-account' ? 'text-[#949494]' : 'text-foreground'}`;

  return (
    <div className={`${cn} ${className}`} style={{ height }}>
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
    </div>
  );
}

export default Empty;

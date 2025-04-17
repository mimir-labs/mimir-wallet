// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@/accounts/useSelectedAccount';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import React, { useState } from 'react';

import AccountMenu from './account-menu';
import AddressCell from './AddressCell';

function AccountSelect() {
  const selected = useSelectedAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const upSm = useMediaQuery('sm');

  const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
  };

  if (!selected) return null;

  return (
    <>
      <div
        onClick={handleAccountOpen}
        className='cursor-pointer h-[32px] sm:h-[42px] border-secondary border-1 rounded-md px-1.5 sm:px-2 bg-secondary sm:bg-transparent gap-2 flex items-center'
      >
        <AddressCell
          showType={upSm}
          className='[&_.AddressCell-Address]:text-tiny [&_.AddressCell-Address]:h-[14px]'
          iconSize={24}
          shorten
          value={selected}
        />
        <ArrowDown className='w-[14px] h-[14px] sm:w-[20px] sm:h-[20px]' />
      </div>
      <AccountMenu anchor='right' onClose={handleAccountClose} open={!!anchorEl} />
    </>
  );
}

export default React.memo(AccountSelect);

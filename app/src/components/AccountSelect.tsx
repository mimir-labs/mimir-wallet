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
        className='border-secondary bg-secondary flex h-[32px] max-w-[140px] cursor-pointer items-center gap-2 rounded-md border-1 px-1.5 sm:h-[42px] sm:max-w-[300px] sm:bg-transparent sm:px-2'
        style={{ width: '-webkit-fill-available' }}
      >
        <AddressCell
          showType={upSm}
          className='[&_.AddressCell-Address]:text-tiny [&_.AddressCell-Address]:h-[14px]'
          iconSize={24}
          shorten
          addressCopyDisabled
          value={selected}
        />
        <ArrowDown className='h-[14px] w-[14px] sm:h-[20px] sm:w-[20px]' />
      </div>
      <AccountMenu anchor='right' onClose={handleAccountClose} open={!!anchorEl} />
    </>
  );
}

export default React.memo(AccountSelect);

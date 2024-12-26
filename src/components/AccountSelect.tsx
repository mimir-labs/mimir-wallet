// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';

import { useSelectedAccount } from '@mimir-wallet/accounts/useSelectedAccount';
import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';

import AccountMenu from './AccountMenu';
import AddressCell from './AddressCell';
import IdentityIcon from './IdentityIcon';

function AccountSelect() {
  const selected = useSelectedAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
  };

  if (!selected) return null;

  return (
    <>
      <Box
        onClick={handleAccountOpen}
        sx={{
          cursor: 'pointer',
          borderRadius: 1,
          paddingX: 1,
          paddingY: 0.3,
          bgcolor: 'common.white',
          border: '1px solid',
          borderColor: 'secondary.main',
          gap: 2,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {downSm ? <IdentityIcon value={selected} /> : <AddressCell shorten showType value={selected} />}
        <SvgIcon component={ArrowDown} fontSize='small' inheritViewBox />
      </Box>
      <AccountMenu anchor='right' onClose={handleAccountClose} open={!!anchorEl} />
    </>
  );
}

export default React.memo(AccountSelect);

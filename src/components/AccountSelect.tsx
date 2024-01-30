// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as ArrowDown } from '@mimir-wallet/assets/svg/ArrowDown.svg';
import { useSelectedAccount } from '@mimir-wallet/hooks';
import { Box, SvgIcon } from '@mui/material';
import React, { useState } from 'react';

import AccountMenu from './AccountMenu';
import AddressCell from './AddressCell';

function AccountSelect() {
  const selected = useSelectedAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        onClick={handleAccountOpen}
        sx={{ cursor: 'pointer', borderRadius: 1, paddingX: 1, bgcolor: 'secondary.main', border: '1px solid', borderColor: 'secondary.main', gap: 2, display: 'flex', alignItems: 'center' }}
      >
        <AddressCell shorten showType size='small' value={selected} />
        <SvgIcon component={ArrowDown} fontSize='small' inheritViewBox />
      </Box>
      <AccountMenu anchor='right' onClose={handleAccountClose} open={!!anchorEl} />
    </>
  );
}

export default React.memo(AccountSelect);

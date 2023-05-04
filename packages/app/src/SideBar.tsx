// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { Box, Button, Divider, Drawer, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import { ArrowDown, IconAddressBook, IconCopy, IconDapp, IconExternal, IconProfile, IconQr, IconTransaction, IconTransfer } from '@mimirdev/app-config/icons';
import { AccountMenu, AccountSmall } from '@mimirdev/react-components';
import { useApi, useCall, useSelectedAccount } from '@mimirdev/react-hooks';

function NavLink({ Icon, label, to }: { to: string; Icon: React.ComponentType<any>; label: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const matched = useMemo(() => matchPath(to, location.pathname), [location.pathname, to]);

  const handleClick = () => {
    navigate(to);
  };

  return (
    <Button
      className={matched ? 'Mui-active' : undefined}
      fullWidth
      onClick={handleClick}
      size='large'
      startIcon={<Icon sx={{ fontSize: '1.25rem !important', color: 'inherit' }} />}
      sx={{
        justifyContent: 'flex-start',
        marginTop: 2.5,
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'grey.300',
        '> p': {
          color: 'text.secondary'
        },
        ':hover,&.Mui-active': {
          bgcolor: 'secondary.main',
          color: 'primary.main',

          '>p': {
            color: 'text.primary'
          }
        }
      }}
    >
      <Typography fontSize='1rem' fontWeight={700}>
        {label}
      </Typography>
    </Button>
  );
}

function SideBar() {
  const { api } = useApi();
  const selected = useSelectedAccount();
  const balances = useCall<DeriveBalancesAll>(api.derive.balances.all, [selected]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
  };

  return (
    <Drawer PaperProps={{ sx: { width: 222, top: 56, paddingX: 2, paddingY: 2.5 } }} anchor='left' variant='permanent'>
      <Paper sx={{ padding: 1 }} variant='outlined'>
        <Stack alignItems='center' direction='row' spacing={1}>
          <Box sx={{ width: 'calc(100% - 30px)' }}>
            <AccountSmall balance={balances?.freeBalance} value={selected} withBalance />
          </Box>
          <IconButton onClick={handleAccountOpen} size='small'>
            <ArrowDown sx={{ fontSize: '0.75rem' }} />
          </IconButton>
        </Stack>
        <Divider sx={{ marginY: 1.25 }} />
        <IconButton color='primary' size='small'>
          <IconQr />
        </IconButton>
        <IconButton color='primary' size='small'>
          <IconCopy />
        </IconButton>
        <IconButton color='primary' size='small'>
          <IconExternal />
        </IconButton>
        <IconButton color='primary' size='small'>
          <IconTransfer />
        </IconButton>
      </Paper>
      <NavLink Icon={IconProfile} label='Profile' to='/' />
      <NavLink Icon={IconDapp} label='Dapp' to='/dapp' />
      <NavLink Icon={IconTransaction} label='Transactions' to='/transactions' />
      <NavLink Icon={IconAddressBook} label='Address Book' to='/address-book' />
      <AccountMenu anchorEl={anchorEl} handleClose={handleAccountClose} />
    </Drawer>
  );
}

export default SideBar;

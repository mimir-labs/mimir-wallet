// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Divider, Drawer, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { ReactComponent as ArrowRight } from '@mimirdev/assets/svg/ArrowRight.svg';
import { ReactComponent as IconAddressBook } from '@mimirdev/assets/svg/icon-address-book.svg';
import { ReactComponent as IconCopy } from '@mimirdev/assets/svg/icon-copy.svg';
import { ReactComponent as IconDapp } from '@mimirdev/assets/svg/icon-dapp.svg';
import { ReactComponent as IconExternal } from '@mimirdev/assets/svg/icon-external.svg';
import { ReactComponent as IconProfile } from '@mimirdev/assets/svg/icon-profile.svg';
import { ReactComponent as IconQr } from '@mimirdev/assets/svg/icon-qr.svg';
import { ReactComponent as IconTransaction } from '@mimirdev/assets/svg/icon-transaction.svg';
import { ReactComponent as IconTransfer } from '@mimirdev/assets/svg/icon-transfer.svg';
import { AccountMenu, AddressCell, BalanceFree, NetworkIcon } from '@mimirdev/components';
import { useApi, useSelectedAccount } from '@mimirdev/hooks';

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
      startIcon={<SvgIcon component={Icon} inheritViewBox sx={{ fontSize: '1.25rem !important', color: 'inherit' }} />}
      sx={{
        justifyContent: 'flex-start',
        marginTop: 2.5,
        padding: '15px 20px',
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
      variant='text'
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Drawer PaperProps={{ sx: { width: 222, top: 56, paddingX: 1.5, paddingY: 2 } }} anchor='left' variant='permanent'>
        <Paper sx={{ padding: 1 }} variant='outlined'>
          <Stack alignItems='center' direction='row' onClick={handleAccountOpen} spacing={1} sx={{ cursor: 'pointer', width: '100%' }}>
            <AddressCell size='small' value={selected} />
            <SvgIcon color='primary' component={ArrowRight} inheritViewBox sx={{ fontSize: '0.75rem' }} />
          </Stack>
          <Divider sx={{ marginY: 1 }} />
          <Stack alignItems='center' direction='row' spacing={0.5}>
            <NetworkIcon genesisHash={api.genesisHash.toHex()} size={14} />
            <Typography color='text.secondary' fontSize={12}>
              <BalanceFree params={selected} />
            </Typography>
          </Stack>
          <Divider sx={{ marginY: 1 }} />
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconQr} inheritViewBox />
          </IconButton>
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconCopy} inheritViewBox />
          </IconButton>
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconExternal} inheritViewBox />
          </IconButton>
          <IconButton color='primary' size='small'>
            <SvgIcon component={IconTransfer} inheritViewBox />
          </IconButton>
        </Paper>
        <NavLink Icon={IconProfile} label='Profile' to='/' />
        <NavLink Icon={IconDapp} label='Dapp' to='/dapp' />
        <NavLink Icon={IconTransaction} label='Transactions' to='/transactions' />
        <NavLink Icon={IconAddressBook} label='Address Book' to='/address-book' />
        <AccountMenu onClose={handleAccountClose} open={!!anchorEl} />
      </Drawer>
      <Box
        sx={{
          paddingTop: 'calc(56px + 20px)',
          paddingLeft: 'calc(222px + 20px)',
          paddingRight: '20px',
          paddingBottom: '20px',
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}

export default SideBar;

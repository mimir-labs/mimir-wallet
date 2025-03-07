// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { useUnConfirmMultisigs } from '@/accounts/useGroupAccounts';
import { useSelectedAccountCallback } from '@/accounts/useSelectedAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
// import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { AddressCell, CreateMultisigDialog } from '@/components';
import { useToggle } from '@/hooks/useToggle';
import { useWallet } from '@/wallet/useWallet';
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Detected({ accounts, onCreateMultisig }: { accounts: AccountData[]; onCreateMultisig: () => void }) {
  const selectAccount = useSelectedAccountCallback();
  const [selected, setSelected] = useState<string>(accounts[0].address);
  const [, confirm] = useUnConfirmMultisigs();
  const navigate = useNavigate();

  const handleClick = () => {
    confirm(accounts.map((item) => item.address));
    selectAccount(selected);
    navigate('/', { replace: true });
  };

  return (
    <Stack spacing={1} sx={{ width: { xs: '100%', sm: 400 } }}>
      <Select fullWidth variant='outlined' value={selected} onChange={(e) => setSelected(e.target.value)}>
        {accounts.map((item) => (
          <MenuItem value={item.address} key={item.address}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <AddressCell value={item.address} withCopy showType />
            </Box>
          </MenuItem>
        ))}
      </Select>
      <Button color='primary' fullWidth onClick={handleClick}>
        Login
      </Button>

      <Divider />

      <Button color='primary' variant='outlined' fullWidth onClick={onCreateMultisig}>
        Create Multisig Account
      </Button>
      <Button component={Link} to='/create-pure' color='primary' variant='outlined' fullWidth>
        Create Pure Proxy
      </Button>
      <Button onClick={handleClick} variant='text' color='primary'>
        {'Skip>'}
      </Button>
    </Stack>
  );
}

function Welcome() {
  const { connectedWallets, openWallet } = useWallet();
  const { accounts } = useAccount();
  const [createMultisigOpen, toggleCreateMultisigOpen] = useToggle();
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const isConnected = Object.keys(connectedWallets).length > 0;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 2, sm: 4, md: 6, lg: 8 },
          height: '100%'
        }}
      >
        <Box sx={{ width: { xs: 185, sm: 309 }, overflow: 'hidden', borderRadius: { xs: 1.8, sm: 3 } }}>
          <video muted playsInline autoPlay loop src='/ux.mp4' controls={false} width='100%' />
        </Box>
        <Stack spacing={2} width={{ xs: '100%', sm: 'auto' }}>
          <Typography
            variant='h1'
            sx={{ fontWeight: 700, fontSize: { xs: '20px', sm: '30px', md: '40px' }, lineHeight: 1.1 }}
          >
            Manage your assets{downSm ? '' : <br />} like a pro
          </Typography>
          <Typography sx={{ fontSize: '1rem', lineHeight: '19px', letterSpacing: '0.16px' }}>
            · Multisig Accounts
            <br />· Proxy Accounts
            <br />· Batch Transactions
            <br />· Account Structure Overview
          </Typography>
          {isConnected ? (
            accounts.length === 0 ? (
              <>
                <Button
                  startIcon={<SvgIcon inheritViewBox component={IconAdd} sx={{ color: 'white' }} />}
                  sx={{ width: { xs: 'auto', sm: 210 } }}
                  color='primary'
                  onClick={toggleCreateMultisigOpen}
                >
                  Create Multisig Account
                </Button>
                <Button
                  component={Link}
                  to='/create-pure'
                  startIcon={<SvgIcon inheritViewBox component={IconAdd} sx={{ color: 'white' }} />}
                  sx={{ width: { xs: 'auto', sm: 210 } }}
                  color='primary'
                >
                  Create Pure Proxy
                </Button>
              </>
            ) : (
              <>
                <Typography fontWeight={800} fontSize={{ xs: '1rem', sm: '1.25rem' }}>
                  Detected Account
                </Typography>
                <Detected accounts={accounts} onCreateMultisig={toggleCreateMultisigOpen} />
              </>
            )
          ) : (
            <Button sx={{ width: { xs: 'auto', sm: 210 } }} color='primary' onClick={openWallet}>
              Connect Wallet
            </Button>
          )}
        </Stack>
      </Box>

      <CreateMultisigDialog open={createMultisigOpen} onClose={toggleCreateMultisigOpen} />
    </>
  );
}

export default Welcome;

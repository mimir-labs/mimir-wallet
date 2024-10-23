// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@mimir-wallet/hooks/types';

import { Box, Button, Divider, MenuItem, Select, Stack, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
// import IconSend from '@mimir-wallet/assets/svg/icon-send-fill.svg?react';
import { AddressCell, CreateMultisigDialog } from '@mimir-wallet/components';
import { useAccount, useSelectedAccountCallback, useToggle, useUnConfirmMultisigs } from '@mimir-wallet/hooks';
import { useWallet } from '@mimir-wallet/hooks/useWallet';

function Detected({ accounts, onCreateMultisig }: { accounts: AccountData[]; onCreateMultisig: () => void }) {
  const selectAccount = useSelectedAccountCallback();
  const [selected, setSelected] = useState<string>(accounts[0].address);
  const [, confirm] = useUnConfirmMultisigs();

  const handleClick = () => {
    confirm(accounts.map((item) => item.address));
    selectAccount(selected);
  };

  return (
    <Stack spacing={1} sx={{ width: 400 }}>
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

  const isConnected = Object.keys(connectedWallets).length > 0;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'column' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          height: '100%'
        }}
      >
        <Box sx={{ width: 309, overflow: 'hidden', borderRadius: 3 }}>
          <video muted playsInline autoPlay loop src='/ux.mp4' controls={false} width='100%' />
        </Box>
        <Stack spacing={2}>
          <Typography variant='h1' sx={{ fontWeight: 700, fontSize: '40px', lineHeight: 1.25 }}>
            Start your ultimate
            <br />
            multisig journey
          </Typography>
          <Typography sx={{ fontSize: '1rem', lineHeight: '19px', letterSpacing: '0.16px' }}>
            · More security fund
            <br />
            · Policy Rules
            <br />· Enterprise-Level Operation
          </Typography>
          {isConnected ? (
            accounts.length === 0 ? (
              <>
                <Button
                  startIcon={<SvgIcon inheritViewBox component={IconAdd} sx={{ color: 'white' }} />}
                  sx={{ width: 210 }}
                  color='primary'
                  onClick={toggleCreateMultisigOpen}
                >
                  Create Multisig Account
                </Button>
                <Button
                  component={Link}
                  to='/create-pure'
                  startIcon={<SvgIcon inheritViewBox component={IconAdd} sx={{ color: 'white' }} />}
                  sx={{ width: 210 }}
                  color='primary'
                >
                  Create Pure Proxy
                </Button>
              </>
            ) : (
              <>
                <Typography fontWeight={800} fontSize='1.25rem'>
                  Detected Multisig
                </Typography>
                <Detected accounts={accounts} onCreateMultisig={toggleCreateMultisigOpen} />
              </>
            )
          ) : (
            <Button sx={{ width: 210 }} color='primary' onClick={openWallet}>
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

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconClose from '@/assets/svg/icon-close.svg?react';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

function ToggleAlert({ address, setAlertOpen }: { address: string; setAlertOpen: (state: boolean) => void }) {
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [forceHide, setForceHide] = useState(false);

  const hasThisAccount = useMemo(
    () => isLocalAccount(address) || isLocalAddress(address, true),
    [address, isLocalAccount, isLocalAddress]
  );

  const alertOpen = !forceHide && !hasThisAccount;

  useEffect(() => {
    setAlertOpen(alertOpen);
  }, [alertOpen, setAlertOpen]);

  return alertOpen ? (
    <>
      <Box
        onClick={
          hasThisAccount
            ? undefined
            : () => {
                addAddressBook(address, true);
              }
        }
        sx={{
          zIndex: 50,
          cursor: 'pointer',
          position: 'sticky',
          top: 56,
          width: '100%',
          paddingLeft: { sm: 2, xs: 1 },
          paddingY: 0.5,
          display: 'flex',
          alignItems: 'center',
          height: 38,
          gap: { sm: 1, xs: 0.5 },
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <SvgIcon component={IconInfo} inheritViewBox />

        {!hasThisAccount && (
          <Typography sx={{ flex: '1' }}>
            You are not a member of this account, currently in Watch-only mode.
            <Box component='span' sx={{ cursor: 'pointer', ':hover': { textDecorationLine: 'underline' } }}>
              {'Add to watch list>>'}
            </Box>
          </Typography>
        )}

        <IconButton
          color='inherit'
          size='small'
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setForceHide(true);
          }}
        >
          <SvgIcon component={IconClose} inheritViewBox />
        </IconButton>
      </Box>
    </>
  ) : null;
}

export default ToggleAlert;

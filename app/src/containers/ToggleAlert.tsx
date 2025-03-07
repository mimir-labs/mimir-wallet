// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconClose from '@/assets/svg/icon-close.svg?react';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { FormatBalance, Fund } from '@/components';
import { useApi } from '@/hooks/useApi';
import { formatUnits } from '@/utils';
import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

function ToggleAlert({ address, setAlertOpen }: { address: string; setAlertOpen: (state: boolean) => void }) {
  const { api } = useApi();
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [existing, setExisting] = useState(true);
  const [fundOpen, toggleFundOpen] = useToggle(false);
  const [forceHide, setForceHide] = useState(false);

  const hasThisAccount = useMemo(
    () => isLocalAccount(address) || isLocalAddress(address, true),
    [address, isLocalAccount, isLocalAddress]
  );

  useEffect(() => {
    const unSubPromise: Promise<() => void> = api.derive.balances.all(address, (allBalances) => {
      const existing = allBalances.freeBalance
        .add(allBalances.reservedBalance)
        .gte(api.consts.balances.existentialDeposit);

      setExisting(existing);
    });

    return () => {
      unSubPromise?.then((unsub) => unsub());
    };
  }, [address, api]);

  const alertOpen = !forceHide && !(hasThisAccount && existing);

  useEffect(() => {
    setAlertOpen(alertOpen);
  }, [alertOpen, setAlertOpen]);

  return alertOpen ? (
    <>
      <Box
        onClick={
          hasThisAccount
            ? !existing
              ? () => toggleFundOpen(true)
              : undefined
            : () => {
                addAddressBook(address, true);
              }
        }
        sx={{
          zIndex: 10,
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
        {hasThisAccount && !existing && (
          <Typography sx={{ flex: '1' }}>
            To prevent this account from being purged, please transfer{' '}
            <FormatBalance value={api.consts.balances.existentialDeposit} />
            {api.registry.chainTokens[0].toString()} to keep the account alive.
          </Typography>
        )}

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

      <Fund
        defaultValue={formatUnits(api.consts.balances.existentialDeposit, api.registry.chainDecimals[0])}
        onClose={toggleFundOpen}
        open={fundOpen}
        receipt={address}
      />
    </>
  ) : null;
}

export default ToggleAlert;

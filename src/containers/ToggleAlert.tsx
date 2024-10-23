// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import IconClose from '@mimir-wallet/assets/svg/icon-close.svg?react';
import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import { FormatBalance, Fund } from '@mimir-wallet/components';
import { useAccount, useApi } from '@mimir-wallet/hooks';
import { formatUnits } from '@mimir-wallet/utils';

function ToggleAlert({ setAlertOpen }: { setAlertOpen: (state: boolean) => void }) {
  const { api } = useApi();
  const { current, addresses, isLocalAccount, addAddressBook } = useAccount();
  const [existing, setExisting] = useState(true);
  const [fundOpen, toggleFundOpen] = useToggle(false);
  const [forceHide, setForceHide] = useState(false);

  const hasThisAccount = useMemo(
    () => !!current && (isLocalAccount(current) || !!addresses.find(({ watchlist }) => !!watchlist)),
    [addresses, current, isLocalAccount]
  );

  useEffect(() => {
    let unSubPromise: Promise<() => void> | undefined;

    if (current) {
      unSubPromise = api.derive.balances.all(current, (allBalances) => {
        const existing = allBalances.freeBalance
          .add(allBalances.reservedBalance)
          .gte(api.consts.balances.existentialDeposit);

        setExisting(existing);
      });
    } else {
      setExisting(true);
    }

    return () => {
      unSubPromise?.then((unsub) => unsub());
    };
  }, [api, current, setAlertOpen]);

  useEffect(() => {
    setForceHide(false);
  }, [current]);

  const alertOpen = !forceHide && (!hasThisAccount || !existing);

  useEffect(() => {
    setAlertOpen(alertOpen);
  }, [alertOpen, setAlertOpen]);

  return alertOpen ? (
    <>
      <Box
        onClick={toggleFundOpen}
        sx={{
          zIndex: 10,
          cursor: 'pointer',
          position: 'sticky',
          top: 56,
          width: '100%',
          paddingX: 2,
          display: 'flex',
          alignItems: 'center',
          height: 36,
          gap: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <SvgIcon component={IconInfo} inheritViewBox />
        {!existing && (
          <Typography sx={{ flex: '1' }}>
            To prevent this account from being purged, please transfer{' '}
            <FormatBalance value={api.consts.balances.existentialDeposit} /> to keep the account alive.
          </Typography>
        )}

        {!hasThisAccount && (
          <Typography sx={{ flex: '1' }}>
            You are not a member of this account, currently in Watch-only mode.
            <Box
              component='span'
              sx={{ cursor: 'pointer', ':hover': { textDecorationLine: 'underline' } }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                addAddressBook(current, true);
              }}
            >
              {'Add to watch list>>'}
            </Box>
          </Typography>
        )}

        <IconButton
          color='inherit'
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
        receipt={current}
      />
    </>
  ) : null;
}

export default ToggleAlert;

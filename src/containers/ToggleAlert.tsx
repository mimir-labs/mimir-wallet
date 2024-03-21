// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconClose } from '@mimir-wallet/assets/svg/icon-close.svg';
import { ReactComponent as IconInfo } from '@mimir-wallet/assets/svg/icon-info-fill.svg';
import { FormatBalance, Fund } from '@mimir-wallet/components';
import { useApi, useSelectedAccount, useToggle } from '@mimir-wallet/hooks';
import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import React, { useContext, useEffect } from 'react';

import { BaseContainerCtx } from './BaseContainer';

function ToggleAlert({ setAlertOpen }: { setAlertOpen: (state: boolean) => void }) {
  const { api } = useApi();
  const selected = useSelectedAccount();
  const { alertOpen } = useContext(BaseContainerCtx);
  const [open, toggleOpen] = useToggle();

  useEffect(() => {
    let unSubPromise: Promise<() => void> | undefined;

    if (selected) {
      unSubPromise = api.derive.balances.all(selected, (allBalances) => {
        if (allBalances.freeBalance.add(allBalances.reservedBalance).lt(api.consts.balances.existentialDeposit)) {
          setAlertOpen(true);
        } else {
          setAlertOpen(false);
        }
      });
    } else {
      setAlertOpen(false);
    }

    return () => {
      unSubPromise?.then((unsub) => unsub());
    };
  }, [api, setAlertOpen, selected]);

  return alertOpen ? (
    <>
      <Box
        onClick={toggleOpen}
        sx={{
          cursor: 'pointer',
          position: 'fixed',
          top: 56,
          width: '100%',
          zIndex: 1201,
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
        <Typography sx={{ flex: '1' }}>
          To prevent this account from being purged, please transfer <FormatBalance value={api.consts.balances.existentialDeposit} /> to keep the account alive.
        </Typography>
        <IconButton color='inherit' onClick={() => setAlertOpen(false)}>
          <SvgIcon component={IconClose} inheritViewBox />
        </IconButton>
      </Box>
      <Fund defaultValue={api.consts.balances.existentialDeposit} onClose={toggleOpen} open={open} receipt={selected} />
    </>
  ) : null;
}

export default ToggleAlert;

// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Compact } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { ReactComponent as IconFail } from '@mimir-wallet/assets/svg/icon-failed-fill.svg';
import { ReactComponent as IconLock } from '@mimir-wallet/assets/svg/icon-lock.svg';
import { ReactComponent as IconQuestion } from '@mimir-wallet/assets/svg/icon-question.svg';
import { ReactComponent as IconSuccess } from '@mimir-wallet/assets/svg/icon-success-fill.svg';
import { ReactComponent as IconTransfer } from '@mimir-wallet/assets/svg/icon-transfer.svg';
import { ReactComponent as IconUnLock } from '@mimir-wallet/assets/svg/icon-unlock.svg';
import { useApi, useCall, useToggle } from '@mimir-wallet/hooks';
import { Box, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { BN } from '@polkadot/util';
import React, { useMemo } from 'react';

import AddressName from './AddressName';
import FormatBalance from './FormatBalance';
import Fund from './Fund';

interface Props {
  isUnLock?: boolean;
  address?: AccountId | AccountIndex | Address | string | null;
  value?: Compact<any> | BN | string | number;
  tip?: React.ReactNode;
}

function LockItem({ address, isUnLock, tip, value }: Props) {
  const { api } = useApi();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [address]);
  const [open, toggleOpen] = useToggle();

  const isEnought = useMemo(() => {
    if (value && allBalances) {
      return allBalances.freeBalance.gte(new BN(value.toString()));
    }

    return true;
  }, [allBalances, value]);

  const icon = <SvgIcon color='primary' component={isUnLock ? IconUnLock : IconLock} fontSize='medium' inheritViewBox sx={{ opacity: 0.5 }} />;

  return (
    <>
      {value && address && <Fund defaultValue={value.toString()} onClose={toggleOpen} open={open} receipt={address.toString()} />}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography>
            <AddressName value={address} /> {isUnLock ? 'unlock' : 'lock'}
          </Typography>
          <Tooltip title={tip}>
            <SvgIcon color='primary' component={IconQuestion} fontSize='medium' inheritViewBox sx={{ opacity: 0.5 }} />
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isUnLock && !isEnought && (
            <IconButton color='primary' onClick={toggleOpen} size='small'>
              <SvgIcon component={IconTransfer} inheritViewBox />
            </IconButton>
          )}
          <Typography>
            <FormatBalance value={value} />
          </Typography>
          {!isUnLock && <SvgIcon color='primary' component={isEnought ? IconSuccess : IconFail} fontSize='medium' inheritViewBox />}
        </Box>
      </Box>
    </>
  );
}

export const LockContainer = React.memo(function ({ children }: { children: React.ReactNode }) {
  return (
    <Stack bgcolor='secondary.main' borderRadius={1} padding={1} spacing={1}>
      {children}
    </Stack>
  );
});

export default React.memo(LockItem);

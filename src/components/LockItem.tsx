// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Compact } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box, Stack, SvgIcon, Typography } from '@mui/material';
import { BN } from '@polkadot/util';
import React, { useMemo } from 'react';

import { ReactComponent as IconLock } from '@mimirdev/assets/svg/icon-lock.svg';
import { ReactComponent as IconQuestion } from '@mimirdev/assets/svg/icon-question.svg';
import { ReactComponent as IconSuccess } from '@mimirdev/assets/svg/icon-success-fill.svg';
import { ReactComponent as IconTransfer } from '@mimirdev/assets/svg/icon-transfer.svg';
import { ReactComponent as IconUnLock } from '@mimirdev/assets/svg/icon-unlock.svg';
import { useApi, useCall } from '@mimirdev/hooks';

import AddressName from './AddressName';
import FormatBalance from './FormatBalance';

interface Props {
  isUnLock?: boolean;
  address?: AccountId | AccountIndex | Address | string | null;
  value?: Compact<any> | BN | string | number | null;
}

function LockItem({ address, isUnLock, value }: Props) {
  const { api } = useApi();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [value]);

  const isEnought = useMemo(() => {
    if (value && allBalances) {
      return allBalances.freeBalance.gte(new BN(value.toString()));
    }

    return true;
  }, [allBalances, value]);

  const icon = <SvgIcon color='primary' component={isUnLock ? IconUnLock : IconLock} fontSize='medium' inheritViewBox sx={{ opacity: 0.5 }} />;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography>
          <AddressName value={address} /> {isUnLock ? 'unlock' : 'lock'}
        </Typography>
        <SvgIcon color='primary' component={IconQuestion} fontSize='medium' inheritViewBox sx={{ opacity: 0.5 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!isEnought && <SvgIcon color='primary' component={IconTransfer} fontSize='medium' inheritViewBox />}
        <Typography>
          <FormatBalance value={value} />
        </Typography>
        {isEnought && <SvgIcon color='primary' component={IconSuccess} fontSize='medium' inheritViewBox />}
      </Box>
    </Box>
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

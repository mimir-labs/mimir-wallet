// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box, CircularProgress, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { BN } from '@polkadot/util';
import React, { useEffect, useMemo, useRef } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import IconFail from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconFund from '@mimir-wallet/assets/svg/icon-fund-fill.svg?react';
import IconLock from '@mimir-wallet/assets/svg/icon-lock.svg?react';
import IconQuestion from '@mimir-wallet/assets/svg/icon-question-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success-fill.svg?react';
import IconUnLock from '@mimir-wallet/assets/svg/icon-unlock.svg?react';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useNativeBalances } from '@mimir-wallet/hooks/useBalances';
import { useToggle } from '@mimir-wallet/hooks/useToggle';
import { formatUnits } from '@mimir-wallet/utils';

import AddressName from './AddressName';
import FormatBalance from './FormatBalance';
import Fund from './Fund';

interface Props {
  isUnLock?: boolean;
  address: AccountId | AccountIndex | Address | string;
  value: Compact<any> | BN | string | number;
  tip?: React.ReactNode;
  onEnoughtState?: (address: string, isEnought: boolean | 'pending') => void;
}

function LockItem({ address, isUnLock, tip, value, onEnoughtState }: Props) {
  const { api } = useApi();
  const [allBalances] = useNativeBalances(address.toString());
  const [open, toggleOpen] = useToggle();
  const onEnoughtStateRef = useRef(onEnoughtState);

  onEnoughtStateRef.current = onEnoughtState;

  const isEnought = useMemo(() => {
    if (allBalances) {
      return allBalances.transferrable.gte(new BN(value.toString()));
    }

    return 'pending';
  }, [allBalances, value]);

  useEffect(() => {
    onEnoughtStateRef.current?.(encodeAddress(address.toString()), isEnought);
  }, [address, isEnought]);

  const icon = (
    <SvgIcon color='primary' component={isUnLock ? IconUnLock : IconLock} inheritViewBox sx={{ opacity: 0.5 }} />
  );

  return (
    <>
      {value && address && (
        <Fund
          defaultValue={formatUnits(value, api.registry.chainDecimals[0])}
          onClose={toggleOpen}
          open={open}
          receipt={address.toString()}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 0.5, sm: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {icon}
          <AddressName value={address} /> {isUnLock ? 'unlock' : 'lock'}
          <Tooltip title={tip}>
            <SvgIcon color='primary' component={IconQuestion} inheritViewBox sx={{ opacity: 0.5 }} />
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {!isUnLock && isEnought === false && (
            <IconButton color='primary' onClick={toggleOpen} size='small'>
              <SvgIcon component={IconFund} inheritViewBox />
            </IconButton>
          )}

          <Typography>
            <FormatBalance value={value} />
          </Typography>

          {!isUnLock &&
            (isEnought === 'pending' ? (
              <CircularProgress size={16} />
            ) : (
              <SvgIcon
                color={isEnought ? 'success' : 'error'}
                component={isEnought ? IconSuccess : IconFail}
                inheritViewBox
              />
            ))}
        </Box>
      </Box>
    </>
  );
}

export const LockContainer = React.memo(({ children }: { children: React.ReactNode }) => {
  return (
    <Stack bgcolor='secondary.main' borderRadius={1} padding={1} spacing={1}>
      {children}
    </Stack>
  );
});

export default React.memo(LockItem);

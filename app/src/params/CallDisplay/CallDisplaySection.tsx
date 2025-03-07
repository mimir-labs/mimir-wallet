// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconCancel from '@/assets/svg/icon-cancel.svg?react';
import IconIdentity from '@/assets/svg/icon-identity.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import { Box, SvgIcon } from '@mui/material';
import React from 'react';

function CallDisplaySection({ section, method }: { section?: string; method?: string }) {
  if (
    [
      'balances.transfer',
      'balances.transferKeepAlive',
      'balances.transferAllowDeath',
      'balances.forceTransfer',
      'balances.transferAll'
    ].includes(`${section}.${method}`)
  ) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <SvgIcon color='primary' component={IconSend} inheritViewBox />
        Transfer
      </Box>
    );
  }

  if (
    [
      'assets.transfer',
      'assets.transferKeepAlive',
      'assets.forceTransfer',
      'tokens.transfer',
      'tokens.transferKeepAlive',
      'tokens.transferAll',
      'tokens.forceTransfer'
    ].includes(`${section}.${method}`)
  ) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <SvgIcon color='primary' component={IconSend} inheritViewBox />
        Assets Transfer
      </Box>
    );
  }

  if (['identity.setIdentity'].includes(`${section}.${method}`)) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <SvgIcon color='primary' component={IconIdentity} inheritViewBox />
        Identity
      </Box>
    );
  }

  if (['multisig.cancelAsMulti'].includes(`${section}.${method}`)) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <SvgIcon color='error' component={IconCancel} inheritViewBox />
        Cancel
      </Box>
    );
  }

  return `${section}.${method}`;
}

export default React.memo<typeof CallDisplaySection>(CallDisplaySection);

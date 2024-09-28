// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SafetyLevel } from '@mimir-wallet/hooks/types';

import { Box, CircularProgress, SvgIcon, Typography } from '@mui/material';
import React from 'react';

import Logo from '@mimir-wallet/assets/images/logo.png';
import IconFailed from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';

function SafetyCheck({ safetyCheck }: { safetyCheck?: SafetyLevel }) {
  return (
    <Box>
      <Typography fontWeight={700}>Cross-chain Check</Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'secondary.main',
          borderRadius: 1,
          padding: 1,
          marginTop: 0.8
        }}
      >
        <Box sx={{ flex: '1' }}>
          <Box sx={{ fontWeight: 700 }}>Simulation</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component='span' sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Power by
            </Box>
            <img src={Logo} alt='mimir' height={14} />
          </Box>
        </Box>
        {!safetyCheck && <CircularProgress size={20} />}
        {safetyCheck && (
          <>
            <Typography
              sx={{
                fontWeight: 700,
                color:
                  safetyCheck.severity === 'none'
                    ? 'success.main'
                    : safetyCheck.severity === 'error'
                      ? 'error.main'
                      : 'warning.main'
              }}
            >
              {safetyCheck?.message}
            </Typography>
            {safetyCheck.severity === 'none' && <SvgIcon color='success' component={IconSuccess} inheritViewBox />}
            {safetyCheck.severity === 'error' && <SvgIcon color='error' component={IconFailed} inheritViewBox />}
            {safetyCheck.severity === 'warning' && <SvgIcon color='warning' component={IconInfo} inheritViewBox />}
          </>
        )}
      </Box>
    </Box>
  );
}

export default React.memo(SafetyCheck);

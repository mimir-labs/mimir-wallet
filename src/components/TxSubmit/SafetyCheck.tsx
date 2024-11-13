// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SafetyLevel } from '@mimir-wallet/hooks/types';

import { Box, CircularProgress, SvgIcon, Typography } from '@mui/material';
import React from 'react';

import Logo from '@mimir-wallet/assets/images/logo.png';
import IconFailed from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';

function Cell({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
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
        <Box sx={{ fontWeight: 700 }}>{title}</Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component='span' sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Powered by
          </Box>
          <img src={Logo} alt='mimir' height={14} />
        </Box>
      </Box>
      {children}
    </Box>
  );
}

function SafetyCheck({
  isTxBundleLoading,
  txError,
  safetyCheck
}: {
  isTxBundleLoading: boolean;
  txError?: Error | null;
  safetyCheck?: SafetyLevel;
}) {
  return (
    <Box>
      <Typography fontWeight={700}>Transaction Check</Typography>
      {safetyCheck && safetyCheck.severity === 'none' ? null : (
        <Cell title='Cross-chain Check'>
          {!safetyCheck && <CircularProgress size={20} />}
          {safetyCheck && (
            <>
              {safetyCheck.severity === 'none' && <SvgIcon color='success' component={IconSuccess} inheritViewBox />}
              {safetyCheck.severity === 'error' && <SvgIcon color='error' component={IconFailed} inheritViewBox />}
              {safetyCheck.severity === 'warning' && <SvgIcon color='warning' component={IconInfo} inheritViewBox />}

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
            </>
          )}
        </Cell>
      )}
      <Cell title='Authority Check'>
        {isTxBundleLoading && <CircularProgress size={20} />}
        {!isTxBundleLoading && (
          <>
            {!txError ? (
              <SvgIcon color='success' component={IconSuccess} inheritViewBox />
            ) : (
              <SvgIcon color='error' component={IconFailed} inheritViewBox />
            )}

            <Typography
              sx={{
                fontWeight: 700,
                color: !txError ? 'success.main' : 'error.main'
              }}
            >
              {!txError ? 'Permission Granted' : 'Perimission Denied'}
            </Typography>
          </>
        )}
      </Cell>
    </Box>
  );
}

export default React.memo(SafetyCheck);

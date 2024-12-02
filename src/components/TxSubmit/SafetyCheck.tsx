// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';
import type { SafetyLevel } from '@mimir-wallet/hooks/types';

import { LoadingButton } from '@mui/lab';
import { Box, Button, CircularProgress, SvgIcon, Typography } from '@mui/material';
import React, { useState } from 'react';

import { simulate } from '@mimir-wallet/api';
import Logo from '@mimir-wallet/assets/images/logo.png';
import IconFailed from '@mimir-wallet/assets/svg/icon-failed-fill.svg?react';
import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import IconSuccess from '@mimir-wallet/assets/svg/icon-success.svg?react';
import { useApi } from '@mimir-wallet/hooks';

function Cell({ title, children, img }: { img: React.ReactNode; title: React.ReactNode; children: React.ReactNode }) {
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
          {img}
        </Box>
      </Box>
      {children}
    </Box>
  );
}

const EMPTY_SIMULATION = {
  isDone: false,
  success: false,
  error: null,
  isLoading: false
};

function SafetyCheck({
  isTxBundleLoading,
  call,
  account,
  txError,
  safetyCheck
}: {
  isTxBundleLoading: boolean;
  txError?: Error | null;
  safetyCheck?: SafetyLevel;
  call: IMethod;
  account?: string;
}) {
  const [simulation, setSimulation] = useState<{
    isDone: boolean;
    success: boolean;
    error: string | null;
    isLoading: boolean;
  }>(EMPTY_SIMULATION);
  const { api, chain } = useApi();
  const [html, setHtml] = useState<string>('');

  const handleSimulate = () => {
    if (account && call) {
      setSimulation({ ...EMPTY_SIMULATION, isLoading: true });
      simulate(api, chain.wsUrl, call, account)
        .then(({ success, html, error }) => {
          setSimulation({ isDone: true, success, error, isLoading: false });
          setHtml(html);
        })
        .catch((error) => {
          setSimulation({ isDone: true, success: false, error: error.message || 'Unknown Error', isLoading: false });
        });
    }
  };

  return (
    <Box>
      <Typography fontWeight={700}>Transaction Check</Typography>
      <Cell title='Simulation' img={<img src='/images/chopsticks.webp' alt='chopticks' height={24} />}>
        {simulation.isDone ? (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {simulation.success ? (
              <SvgIcon color='success' component={IconSuccess} inheritViewBox />
            ) : (
              <SvgIcon color='error' component={IconFailed} inheritViewBox />
            )}

            <Box sx={{ position: 'relative' }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: simulation.success ? 'success.main' : 'error.main'
                }}
              >
                {simulation.success ? 'Success' : simulation.error || 'Unknown Error'}
              </Typography>

              <Button
                sx={{ position: 'absolute', top: '100%', right: 0, paddingX: 0, minWidth: 0 }}
                variant='text'
                onClick={() => {
                  const newWindow = window.open();

                  newWindow?.document.open();
                  newWindow?.document.write(html);
                  newWindow?.document.close();
                }}
                size='small'
              >
                Details
              </Button>
            </Box>
          </Box>
        ) : (
          <LoadingButton
            variant='outlined'
            loading={simulation.isLoading}
            onClick={handleSimulate}
            startIcon={simulation.isLoading ? <CircularProgress size={20} /> : null}
            loadingPosition='start'
          >
            {simulation.isLoading ? '~30s' : 'Simulate'}
          </LoadingButton>
        )}
      </Cell>

      {safetyCheck && safetyCheck.severity === 'none' ? null : (
        <Cell title='Cross-chain Check' img={<img src={Logo} alt='mimir' height={14} />}>
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
      <Cell title='Authority Check' img={<img src={Logo} alt='mimir' height={14} />}>
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

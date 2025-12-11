// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BuildTx } from './hooks/useBuildTx';
import type { DryRunResult } from '@mimir-wallet/polkadot-core';

import { useChain, useChainStatus } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle } from '@mimir-wallet/ui';
import { Link } from '@tanstack/react-router';
import React from 'react';

export interface TxAlertsProps {
  network: string;
  gasFeeWarning: boolean;
  buildTx: BuildTx;
  dryRunResult?: DryRunResult;
}

/**
 * Centralized alert component for transaction submission.
 * Displays alerts in priority order: destructive (errors) first, then warnings.
 */
function TxAlerts({
  network,
  gasFeeWarning,
  buildTx,
  dryRunResult,
}: TxAlertsProps) {
  const chain = useChain(network);
  const { apiError } = useChainStatus(network);
  const { error, timepointMismatch, delay } = buildTx;

  const hasDelay = Object.keys(delay).length > 0;

  return (
    <>
      {/* Destructive alerts (errors) - shown first */}
      {apiError && (
        <Alert variant="destructive">
          <AlertTitle>
            Fail to connect {chain?.name || network}.{' '}
            <Link to="/setting" search={{ tabs: 'network', type: 'general' }}>
              View in Network Status
            </Link>
          </AlertTitle>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>
            <span className="break-all">{error.message}</span>
          </AlertTitle>
        </Alert>
      )}

      {dryRunResult && !dryRunResult.success && (
        <Alert variant="destructive">
          <AlertTitle>{dryRunResult.error.message}</AlertTitle>
        </Alert>
      )}

      {/* Warning alerts - shown after errors */}
      {gasFeeWarning && (
        <Alert variant="warning">
          <AlertTitle>
            The selected asset is not enough to pay the gas fee.
          </AlertTitle>
        </Alert>
      )}

      {timepointMismatch && (
        <Alert variant="warning">
          <AlertTitle>
            Transaction data is syncing with the chain. Please wait a moment or
            refresh the page before submitting.
          </AlertTitle>
        </Alert>
      )}

      {hasDelay && (
        <Alert variant="warning">
          <AlertTitle>
            This transaction can be executed after review window
          </AlertTitle>
        </Alert>
      )}
    </>
  );
}

export default React.memo(TxAlerts);

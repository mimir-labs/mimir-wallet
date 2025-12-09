// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChain, useChainStatus } from '@mimir-wallet/polkadot-core';
import { Alert, AlertTitle } from '@mimir-wallet/ui';

interface NetworkErrorAlertProps {
  network: string;
  className?: string;
}

/**
 * Alert component that displays network connection errors for the specified chain.
 * Shows when the API is initialized but connection failed or disconnected.
 */
function NetworkErrorAlert({ network, className }: NetworkErrorAlertProps) {
  const chain = useChain(network);
  const { isApiConnected, isApiReady, isApiInitialized, apiError } =
    useChainStatus(network);

  // Only show error when initialized but failed/disconnected
  if (!isApiInitialized || (isApiConnected && isApiReady && !apiError)) {
    return null;
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>
        Fail to connect {chain?.name || network}. View in Network Status
      </AlertTitle>
    </Alert>
  );
}

export default NetworkErrorAlert;

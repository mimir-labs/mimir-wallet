// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod } from '@polkadot/types/types';

import { walletConfig } from '@/config';
import { CONNECT_ORIGIN } from '@/constants';
import { useApi } from '@/hooks/useApi';
import { service } from '@/utils';
import { accountSource } from '@/wallet/useWallet';
import React, { useState } from 'react';

import { Button } from '@mimir-wallet/ui';

import { toastError } from '../utils';

function ProposeTx({
  call,
  account,
  proposer,
  website,
  iconUrl,
  appName,
  note,
  onProposed
}: {
  call: IMethod;
  account?: string;
  proposer?: string;
  website?: string;
  iconUrl?: string;
  appName?: string;
  note?: string;
  onProposed?: () => void;
}) {
  const { genesisHash } = useApi();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!proposer || !account) {
      return;
    }

    const source = accountSource(proposer);

    if (!source) {
      toastError('Please select a valid signer address');

      return;
    }

    const injected = await window.injectedWeb3?.[walletConfig[source]?.key || ''].enable(CONNECT_ORIGIN);
    const injectSigner = injected?.signer;

    if (!injectSigner) {
      toastError(`Please connect to the wallet: ${walletConfig[source]?.name || source}`);

      return;
    }

    if (!injectSigner.signRaw) {
      toastError(`Wallet ${walletConfig[source]?.name || source} does not support signRaw`);

      return;
    }

    setLoading(true);

    try {
      const time = new Date().toUTCString();
      const message = `Submit Propose:
Account: ${account}
Time: ${time}
Genesis Hash: ${genesisHash}
Call Data: ${call.toHex()}`;

      const result = await injectSigner.signRaw({
        address: proposer,
        data: message,
        type: 'bytes'
      });

      await service.submitPropose(
        account,
        call.toHex(),
        proposer,
        result.signature,
        time,
        appName,
        iconUrl,
        note,
        website
      );
      onProposed?.();
    } catch (error) {
      toastError(error);
    }

    setLoading(false);
  };

  return (
    <>
      <Button
        fullWidth
        variant='solid'
        color='primary'
        onPress={handleClick}
        isLoading={loading}
        isDisabled={!account || !proposer}
      >
        Propose
      </Button>
    </>
  );
}

export default React.memo(ProposeTx);

// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { allEndpoints, remoteProxyRelations, useNetwork } from '@mimir-wallet/polkadot-core';
import { Alert, AlertDescription, AlertTitle } from '@mimir-wallet/ui';
import { useMemo } from 'react';

import { FormatBalance } from '@/components';
import { REMOTE_PROXY_DOC_URL } from '@/constants';
import { useProxyDeposit } from '@/hooks/useProxyDeposit';

function Tips({ flexible }: { flexible: boolean }) {
  const { chain, network } = useNetwork();
  const { totalDeposit } = useProxyDeposit(network);

  const remoteProxyChain = useMemo(
    () =>
      remoteProxyRelations[chain.genesisHash]
        ? allEndpoints.find((item) => item.genesisHash === remoteProxyRelations[chain.genesisHash])
        : null,
    [chain.genesisHash]
  );

  return (
    <Alert variant='warning'>
      <AlertTitle className='text-foreground text-base/4 font-bold'>Notice</AlertTitle>
      <AlertDescription className='text-foreground/50 text-xs'>
        {flexible ? (
          <ul style={{ listStyle: 'outside', lineHeight: '14px' }}>
            <li>
              This pure proxy can be ONlY used on{' '}
              <img style={{ display: 'inline', verticalAlign: 'middle' }} width={14} height={14} src={chain.icon} />{' '}
              {chain.name}
              {remoteProxyChain ? (
                <>
                  {' '}
                  <img
                    style={{ display: 'inline', verticalAlign: 'middle' }}
                    width={14}
                    height={14}
                    src={remoteProxyChain.icon}
                  />{' '}
                  {remoteProxyChain.name} (via{' '}
                  <a className='text-primary/50' href={REMOTE_PROXY_DOC_URL} target='_blank' rel='noopener noreferrer'>
                    Remote Proxy
                  </a>
                  ).
                </>
              ) : (
                '.'
              )}
            </li>
            <li>A transaction is required to activate this account.</li>
            <li>
              <FormatBalance
                withCurrency
                value={totalDeposit}
                icon={<img src={chain.tokenIcon} style={{ width: 14, height: 14, verticalAlign: 'middle' }} />}
              />{' '}
              will be locked until the pure proxy removal.
            </li>
          </ul>
        ) : (
          <ul style={{ listStyle: 'outside' }}>
            <li>This multisig could be used on Polkadot, Kusama and ALL Substrate chains.</li>
            <li>Once created, the multisig Signers and threshold can NOT be modified.</li>
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default Tips;

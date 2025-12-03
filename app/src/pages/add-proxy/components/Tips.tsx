// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { allEndpoints, remoteProxyRelations, useNetwork } from '@mimir-wallet/polkadot-core';
import { Alert, AlertDescription, AlertTitle } from '@mimir-wallet/ui';
import { useMemo } from 'react';

import { AddressName, FormatBalance } from '@/components';
import { POLKADOT_PROXY_WIKI_URL, REMOTE_PROXY_DOC_URL } from '@/constants';
import { useProxyDeposit } from '@/hooks/useProxyDeposit';

function Tips({
  network,
  pure,
  proxied,
  proxy
}: {
  network: string;
  pure?: boolean;
  proxied?: string;
  proxy?: string;
}) {
  const { chain } = useNetwork();
  const { totalDeposit } = useProxyDeposit(network);

  const genesisHash = chain.genesisHash;

  const remoteProxyChain = useMemo(
    () =>
      remoteProxyRelations[genesisHash]
        ? allEndpoints.find((item) => item.genesisHash === remoteProxyRelations[genesisHash])
        : null,
    [genesisHash]
  );

  return (
    <Alert variant='warning'>
      <AlertTitle className='text-foreground text-base/4 font-bold'>Notice</AlertTitle>
      <AlertDescription className='text-foreground/50 text-xs'>
        <div>
          <ul style={{ listStyle: 'outside', lineHeight: '14px' }}>
            {!pure && proxied && proxy ? (
              <li>
                <div className='flex items-center'>
                  This grants&nbsp;
                  <AddressName value={proxy} />
                  &nbsp;permission to act for&nbsp;
                  <AddressName value={proxied} />
                </div>
              </li>
            ) : null}
            <li>
              This proxy relationship only functions on{' '}
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
            <li>
              <FormatBalance
                className='gap-[0.2em]'
                withCurrency
                value={totalDeposit}
                icon={<img src={chain.tokenIcon} style={{ width: 14, height: 14, verticalAlign: 'middle' }} />}
              />{' '}
              deposit will be locked for proxy creation until proxy removal.
            </li>
          </ul>
          <a
            className='mt-2.5 flex -translate-x-[18px]'
            href={POLKADOT_PROXY_WIKI_URL}
            target='_blank'
            rel='noopener noreferrer'
          >
            View Detail {'>'}
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default Tips;

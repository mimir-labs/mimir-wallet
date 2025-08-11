// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressName, FormatBalance } from '@/components';
import { POLKADOT_PROXY_WIKI_URL, REMOTE_PROXY_DOC_URL } from '@/constants';
import { useMemo } from 'react';

import { allEndpoints, remoteProxyRelations, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, AlertDescription, AlertTitle } from '@mimir-wallet/ui';

function Tips({ pure, proxied, proxy }: { pure?: boolean; proxied?: string; proxy?: string }) {
  const { chain, genesisHash, api } = useApi();

  const remoteProxyChain = useMemo(
    () =>
      remoteProxyRelations[genesisHash]
        ? allEndpoints.find((item) => item.genesisHash === remoteProxyRelations[genesisHash])
        : null,
    [genesisHash]
  );
  const reservedAmount = useMemo(
    () => api.consts.proxy.proxyDepositBase.add(api.consts.proxy.proxyDepositFactor),
    [api]
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
                value={reservedAmount}
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

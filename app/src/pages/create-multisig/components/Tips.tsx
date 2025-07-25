// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { FormatBalance } from '@/components';
import { REMOTE_PROXY_DOC_URL } from '@/constants';
import { useMemo } from 'react';

import { allEndpoints, remoteProxyRelations, useApi } from '@mimir-wallet/polkadot-core';
import { Alert, Link } from '@mimir-wallet/ui';

function Tips({ flexible }: { flexible: boolean }) {
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
    <Alert
      color='warning'
      classNames={{ title: 'font-bold text-medium text-foreground', description: 'text-foreground/50 text-tiny' }}
      icon={<IconInfo />}
      title='Notice'
      description={
        flexible ? (
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
                  <Link className='text-primary/50' isExternal href={REMOTE_PROXY_DOC_URL}>
                    Remote Proxy
                  </Link>
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
                value={reservedAmount}
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
        )
      }
    />
  );
}

export default Tips;

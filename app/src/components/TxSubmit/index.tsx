// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxSubmitProps } from './types';

import { useQueryAccount } from '@/accounts/useQueryAccount';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, Spinner } from '@mimir-wallet/ui';

import MimirLoading from '../animation/MimirLoading';
import TxSubmit from './TxSubmit';
import TxSubmitErrorBoundary from './TxSubmitErrorBoundary';

function Content({ accountId, ...props }: TxSubmitProps) {
  const { isApiReady, chain } = useApi();
  const [accountData] = useQueryAccount(accountId);

  if (!isApiReady || !accountData) {
    return (
      <div className='flex h-auto w-full flex-col items-center justify-center gap-5 p-4 sm:p-5 md:h-[calc(100dvh-160px)]'>
        {!isApiReady ? (
          <>
            <MimirLoading />
            <h6 className='flex items-center'>
              Connecting to the&nbsp;
              <Avatar src={chain.icon} style={{ width: 20, height: 20 }} />
              &nbsp;{chain.name}...
            </h6>
          </>
        ) : (
          <Spinner size='lg' variant='wave' label={'Fetching account data...'} />
        )}
      </div>
    );
  }

  return (
    <TxSubmitErrorBoundary>
      <TxSubmit {...props} accountData={accountData} />
    </TxSubmitErrorBoundary>
  );
}

function TxSubmitRoot({ network, ...props }: TxSubmitProps & { network: string }) {
  return (
    <SubApiRoot network={network}>
      <Content {...props} />
    </SubApiRoot>
  );
}

export default TxSubmitRoot;

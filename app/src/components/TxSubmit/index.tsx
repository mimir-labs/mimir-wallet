// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxSubmitProps } from './types';

import { useQueryAccount } from '@/accounts/useQueryAccount';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';

import TxSubmit from './TxSubmit';

function Content({ accountId, ...props }: TxSubmitProps) {
  const { isApiReady } = useApi();
  const [accountData] = useQueryAccount(accountId);

  if (!isApiReady || !accountData) {
    return <Spinner size='lg' variant='wave' />;
  }

  return <TxSubmit {...props} accountData={accountData} />;
}

function TxSubmitRoot({ network, ...props }: TxSubmitProps & { network: string }) {
  return (
    <SubApiRoot forceNetwork={network}>
      <Content {...props} />
    </SubApiRoot>
  );
}

export default TxSubmitRoot;

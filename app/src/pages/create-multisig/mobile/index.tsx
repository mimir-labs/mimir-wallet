// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useInputNetwork } from '@/hooks/useInputNetwork';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';

import CreateMultisig from './CreateMultisig';

function PageCreateMultisig() {
  const [network, setNetwork] = useInputNetwork();

  return (
    <SubApiRoot network={network}>
      <CreateMultisig network={network} setNetwork={setNetwork} />
    </SubApiRoot>
  );
}

export default PageCreateMultisig;

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useInputNetwork } from '@/hooks/useInputNetwork';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';

import CreateMultisig from './CreateMultisig';

function PageCreateMultisig({ threshold1 }: { threshold1?: boolean }) {
  const [network, setNetwork] = useInputNetwork();

  return (
    <SubApiRoot network={network}>
      <CreateMultisig threshold1={threshold1} network={network} setNetwork={setNetwork} />
    </SubApiRoot>
  );
}

export default PageCreateMultisig;

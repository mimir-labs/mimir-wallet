// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubApiRoot } from '@mimir-wallet/polkadot-core';

import CreateMultisig from './CreateMultisig';

function PageCreateMultisig({ threshold1 }: { threshold1?: boolean }) {
  return (
    <SubApiRoot>
      <CreateMultisig threshold1={threshold1} />
    </SubApiRoot>
  );
}

export default PageCreateMultisig;

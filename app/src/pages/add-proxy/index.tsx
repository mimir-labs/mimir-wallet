// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubApiRoot } from '@mimir-wallet/polkadot-core';

import AddProxy from './AddProxy';

function PageAddProxy({ pure }: { pure?: boolean }) {
  return (
    <SubApiRoot>
      <AddProxy pure={pure} />
    </SubApiRoot>
  );
}

export default PageAddProxy;

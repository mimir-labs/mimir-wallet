// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelectedAccount } from '@mimir-wallet/hooks';

import Dashboard from './dashboard';

function PageProfile() {
  const selected = useSelectedAccount();

  return selected ? <Dashboard address={selected} /> : null;
}

export default PageProfile;

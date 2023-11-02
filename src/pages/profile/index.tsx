// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGroupAccounts } from '@mimirdev/hooks';

import Profile from './Profile';
import Welcome from './Welcome';

function PageProfile() {
  const { multisig } = useGroupAccounts();

  return multisig.length > 0 ? <Profile /> : <Welcome />;
}

export default PageProfile;

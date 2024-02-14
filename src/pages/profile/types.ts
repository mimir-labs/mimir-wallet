// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

export interface AccountBalance {
  total: BN;
  locked: BN;
  reserved: BN;
  transferrable: BN;
  bonded: BN;
  redeemable: BN;
  unbonding: BN;
}

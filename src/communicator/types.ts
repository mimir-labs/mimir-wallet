// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ResponseTypes } from '@polkadot/extension-base/background/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

export interface State {
  genesisHash: HexString;
  extrinsicSign(
    payload: SignerPayloadJSON,
    id: string
  ): Promise<{ id: string; signature: HexString; signedTransaction?: HexString }>;
  getAccounts(): ResponseTypes['pub(accounts.list)'];
}

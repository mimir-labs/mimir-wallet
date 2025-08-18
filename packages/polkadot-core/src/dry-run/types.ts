// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option, Vec } from '@polkadot/types';
import type { XcmVersionedLocation, XcmVersionedXcm } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { TxDispatchError, TxModuleError } from '../dispatch-error.js';

export type BalanceChange = {
  assetId: 'native' | string;
  from: string;
  to: string;
  amount: bigint;
  genesisHash: HexString;
};

export interface DryRunSuccess {
  success: true;
  rawEvents: unknown;
  balancesChanges: BalanceChange[];
  localXcm?: Option<XcmVersionedXcm>;
  forwardedXcms: Vec<ITuple<[XcmVersionedLocation, Vec<XcmVersionedXcm>]>>;
}

export interface DryRunError {
  success: false;
  rawEvents?: unknown;
  error: TxModuleError | TxDispatchError | Error;
  localXcm?: Option<XcmVersionedXcm>;
  forwardedXcms?: Vec<ITuple<[XcmVersionedLocation, Vec<XcmVersionedXcm>]>>;
}

export type DryRunResult = DryRunSuccess | DryRunError;

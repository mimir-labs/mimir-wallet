// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TxDispatchError, TxModuleError } from '../dispatch-error.js';

export type DryRunResult =
  | {
      success: true;
      rawEvents: any;
      balancesChanges: {
        assetId: 'native' | string;
        from: string;
        to: string;
        amount: bigint;
      }[];
    }
  | {
      success: false;
      rawEvents?: any;
      error: TxModuleError | TxDispatchError | Error;
    };

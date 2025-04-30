// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Result } from '@polkadot/types';
import type { XcmRuntimeApisDryRunCallDryRunEffects, XcmRuntimeApisDryRunError } from '@polkadot/types/lookup';
import type { IMethod } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { DryRunResult } from './types.js';

import { assetDispatchError } from '../dispatch-error.js';
import { parseBalancesChange } from './parse-balances-change.js';

export async function dryRun(
  api: ApiPromise,
  call: IMethod | Uint8Array | HexString,
  address: string
): Promise<DryRunResult> {
  if (!api.call.dryRunApi.dryRunCall) {
    throw new Error('Dry run is not supported');
  }

  const result: Result<XcmRuntimeApisDryRunCallDryRunEffects, XcmRuntimeApisDryRunError> = await (api.call.dryRunApi
    .dryRunCall.meta.params.length === 2
    ? api.call.dryRunApi.dryRunCall(
        {
          system: {
            Signed: address
          }
        },
        call
      )
    : (api.call.dryRunApi.dryRunCall as any)(
        {
          system: {
            Signed: address
          }
        },
        call,
        4
      ));

  console.log('dryRun Result', result.toHuman());

  if (result.isOk) {
    const ok = result.asOk;

    const executionResult = ok.executionResult;

    if (executionResult.isOk) {
      return {
        success: true,
        balancesChanges: parseBalancesChange(ok.emittedEvents)
      };
    } else {
      const err = executionResult.asErr;

      return {
        success: false,
        error: assetDispatchError(api, err.error)
      };
    }
  } else {
    const err = result.asErr;

    return {
      success: false,
      error: new Error(err.type)
    };
  }
}

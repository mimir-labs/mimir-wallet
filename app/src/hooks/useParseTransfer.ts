// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IMethod, Registry } from '@polkadot/types/types';

import { useMemo } from 'react';

import { findAction } from '@mimir-wallet/polkadot-core';

export function useParseTransfer(registry: Registry, fromAddress?: string, call?: IMethod | null) {
  const results = useMemo(() => {
    if (!call) {
      return null;
    }

    const action = findAction(registry, call);

    let assetId: string | null = null;
    let from: string | undefined = fromAddress;
    let to: string;
    let value: string;
    let isAll = false;

    if (!action) {
      return null;
    }

    const [section, method] = action;

    if (section !== 'balances' && section !== 'assets' && section !== 'tokens') {
      return null;
    }

    if (section === 'balances') {
      if (method === 'forceTransfer') {
        from = call.args[0].toString();
        to = call.args[1].toString();
        value = call.args[2].toString();
      } else if (method === 'transferAll') {
        to = call.args[0].toString();
        value = '0';
        isAll = true;
      } else if (method === 'transferAllowDeath' || method === 'transferKeepAlive') {
        to = call.args[0].toString();
        value = call.args[1].toString();
      } else {
        return null;
      }
    } else if (section === 'assets') {
      if (method === 'forceTransfer') {
        assetId = call.args[0].toHex();
        from = call.args[1].toString();
        to = call.args[2].toString();
        value = call.args[3].toString();
      } else if (method === 'transfer' || method === 'transferKeepAlive') {
        assetId = call.args[0].toHex();
        to = call.args[1].toString();
        value = call.args[2].toString();
      } else if (method === 'transferAll') {
        assetId = call.args[1].toHex();
        to = call.args[0].toString();
        value = '0';
        isAll = true;
      } else {
        return null;
      }
    } else if (section === 'tokens') {
      if (method === 'transfer' || method === 'transferKeepAlive') {
        assetId = call.args[1].toHex();
        to = call.args[0].toString();
        value = call.args[2].toString();
      } else if (method === 'forceTransfer') {
        to = call.args[1].toString();
        from = call.args[0].toString();
        assetId = call.args[2].toHex();
        value = call.args[3].toString();
      } else if (method === 'transferAll') {
        to = call.args[0].toString();
        assetId = call.args[1].toHex();
        value = '0';
        isAll = true;
      } else {
        return null;
      }
    } else {
      return null;
    }

    return [assetId, from, to, value, isAll] as const;
  }, [call, fromAddress, registry]);

  return results;
}
